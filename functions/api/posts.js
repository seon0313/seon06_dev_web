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
  const url = new URL(request.url)
  const showAll = url.searchParams.get('all') === '1'

  if (showAll && !(await verifyToken(request, env))) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const stmt = showAll
    ? env.DB.prepare('SELECT * FROM posts ORDER BY created_at DESC')
    : env.DB.prepare('SELECT * FROM posts WHERE published=1 ORDER BY created_at DESC')

  const { results } = await stmt.all()
  return json({ posts: results })
}

export async function onRequestPost({ request, env }) {
  if (!(await verifyToken(request, env))) return json({ error: 'Unauthorized' }, 401)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const { title, category, description, content, js, link, published } = body
  if (!title) return json({ error: 'title required' }, 400)

  const result = await env.DB.prepare(
    `INSERT INTO posts (title, category, description, content, js, link, published)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    title,
    category || 'software',
    description || '',
    content || '',
    js || '',
    link || '',
    published ? 1 : 0
  ).run()

  return json({ id: result.meta.last_row_id }, 201)
}
