export type RequestOptions = RequestInit & { json?: unknown }

export class HttpError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, statusText: string, body: unknown) {
    super(`HTTP ${status}${statusText ? ` ${statusText}` : ''}`)
    this.name = 'HttpError'
    this.status = status
    this.body = body
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export async function request(path: string, options: RequestOptions = {}): Promise<unknown> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured')
  }

  const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
  const { json, headers: providedHeaders, ...init } = options
  const headers = new Headers(providedHeaders)

  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (json !== undefined) {
    if (init.body != null) {
      throw new Error('Provide either body or json, not both')
    }
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body: json === undefined ? init.body : JSON.stringify(json),
  })
  const body = await readResponseBody(response)
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText, body)
  }

  return body
}
