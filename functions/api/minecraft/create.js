const MC_API = 'https://mcapi.seon06.dev'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestGet({ request }) {
  const url        = new URL(request.url)
  const serverType = url.searchParams.get('server_type') || ''
  const version    = url.searchParams.get('version') || ''
  const serverName = url.searchParams.get('server_name') || ''
  const auth       = url.searchParams.get('auth') || ''

  if (!serverType || !version || !serverName || !auth) {
    return json({ error: 'server_type, version, server_name, auth 필요' }, 400)
  }

  const target = MC_API + '/api/v1/server_create' +
    '?server_type=' + encodeURIComponent(serverType) +
    '&version='     + encodeURIComponent(version) +
    '&server_name=' + encodeURIComponent(serverName) +
    '&auth='        + encodeURIComponent(auth)

  const res  = await fetch(target)
  const data = await res.json()
  return json(data, res.status)
}
