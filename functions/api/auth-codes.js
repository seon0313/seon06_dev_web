async function hmacVerify(message, hexSig, secret) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )
  const sigBytes = new Uint8Array(hexSig.match(/.{2}/g).map(b => parseInt(b, 16)))
  return crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(message))
}

async function verifyToken(request, env) {
  try {
    const auth = request.headers.get('Authorization') || ''
    const raw = atob(auth.replace('Bearer ', '').trim())
    const dot = raw.indexOf('.')
    const ts = raw.slice(0, dot)
    const hmac = raw.slice(dot + 1)
    if (Date.now() - Number(ts) > 7 * 24 * 60 * 60 * 1000) return false
    return hmacVerify(ts, hmac, env.ADMIN_PASSWORD)
  } catch {
    return false
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestGet({ request, env }) {
  if (!(await verifyToken(request, env))) return json({ error: 'Unauthorized' }, 401)

  const { results } = await env.DB
    .prepare('SELECT * FROM auth_codes ORDER BY created_at DESC')
    .all()
  return json({ codes: results })
}

export async function onRequestPost({ request, env }) {
  if (!(await verifyToken(request, env))) return json({ error: 'Unauthorized' }, 401)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const { code, label } = body
  if (!code || !code.trim()) return json({ error: 'code required' }, 400)

  try {
    const result = await env.DB
      .prepare('INSERT INTO auth_codes (code, label) VALUES (?, ?)')
      .bind(code.trim(), label?.trim() || '')
      .run()
    return json({ id: result.meta.last_row_id, ok: true }, 201)
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return json({ error: '이미 존재하는 코드입니다.' }, 409)
    throw e
  }
}

export async function onRequestPut({ request, env }) {
  if (!(await verifyToken(request, env))) return json({ error: 'Unauthorized' }, 401)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const { id, is_active } = body
  if (id == null) return json({ error: 'id required' }, 400)

  await env.DB
    .prepare('UPDATE auth_codes SET is_active=? WHERE id=?')
    .bind(is_active ? 1 : 0, id)
    .run()
  return json({ ok: true })
}

export async function onRequestDelete({ request, env }) {
  if (!(await verifyToken(request, env))) return json({ error: 'Unauthorized' }, 401)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const { id } = body
  if (!id) return json({ error: 'id required' }, 400)

  await env.DB
    .prepare('DELETE FROM auth_codes WHERE id=?')
    .bind(id)
    .run()
  return json({ ok: true })
}
