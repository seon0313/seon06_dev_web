const MC_API = 'https://mcapi.seon06.dev'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const serverType = url.searchParams.get('server_type') || 'Vanilla'

  const res = await fetch(
    MC_API + '/api/v1/version_list?server_type=' + encodeURIComponent(serverType)
  )
  const data = await res.json()
  return json(data, res.status)
}
