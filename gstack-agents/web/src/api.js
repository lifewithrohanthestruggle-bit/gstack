/**
 * API client — /api endpoint वर (dev मध्ये Vite proxy, prod मध्ये same origin).
 */

const TOKEN_KEY = 'gstack-agents-token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}
export function setToken(t) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode */
  }
}

function headers(extra = {}) {
  const h = { 'content-type': 'application/json', ...extra }
  const t = getToken()
  if (t) h.authorization = `Bearer ${t}`
  return h
}

export async function getJSON(path) {
  const res = await fetch(path, { headers: headers() })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function postJSON(path, body) {
  const res = await fetch(path, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `${res.status} ${res.statusText}`)
  }
  return res.json()
}

/**
 * POST /api/run → SSE stream.
 * onEvent(type, data) callback ला stream चे events मिळतात.
 */
export async function runStream(body, { onEvent, signal } = {}) {
  const res = await fetch('/api/run', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `${res.status} ${res.statusText}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })

    let sep
    while ((sep = buf.indexOf('\n\n')) >= 0) {
      const block = buf.slice(0, sep)
      buf = buf.slice(sep + 2)

      let event = 'message'
      let data = ''
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data += line.slice(5)
      }
      if (data) {
        try {
          onEvent(event, JSON.parse(data))
        } catch {
          /* malformed — skip */
        }
      }
    }
  }
}
