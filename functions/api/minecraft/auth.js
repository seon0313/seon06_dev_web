function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const { code } = body
  if (!code || typeof code !== 'string' || !code.trim()) {
    return json({ error: 'code required' }, 400)
  }

  const row = await env.DB
    .prepare('SELECT id FROM auth_codes WHERE code=? AND is_active=1')
    .bind(code.trim())
    .first()

  if (!row) return json({ error: 'Invalid code' }, 401)
  return json({ ok: true })
}
