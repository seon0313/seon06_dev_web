async function hmacSign(message, secret) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const { password } = body
  if (!password || password !== env.ADMIN_PASSWORD) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const ts = Date.now().toString()
  const hmac = await hmacSign(ts, env.ADMIN_PASSWORD)
  const token = btoa(`${ts}.${hmac}`)
  return json({ token })
}
