/**
 * index.html이 JS보다 먼저 시작해 둔 요청(window.__prefetch)이 있으면 그 결과를 쓰고,
 * 없으면 평소처럼 fetch한다. 미리 받은 결과는 한 번만 쓴다.
 */
export function getJSON(url) {
  const pre = window.__prefetch
  if (pre && pre.url === url) {
    window.__prefetch = null
    return pre.res.catch(() => fetchJSON(url))
  }
  return fetchJSON(url)
}

function fetchJSON(url) {
  return fetch(url).then(r => (r.ok ? r.json() : Promise.reject(r.status)))
}
