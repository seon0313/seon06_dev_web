const MC_API = 'https://mcapi.seon06.dev'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestGet({ request }) {
  const url  = new URL(request.url)
  const auth = url.searchParams.get('auth') || ''

  if (!auth) return json({ error: 'auth required' }, 400)

  const res  = await fetch(MC_API + '/api/v1/get_servers?auth=' + encodeURIComponent(auth))
  const data = await res.json()
  return json(data, res.status)
}
