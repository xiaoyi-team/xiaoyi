export type RequestOptions = RequestInit & { json?: unknown; timeoutMs?: number; classifyNetworkErrors?: boolean }

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed', { cause })
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  readonly timeoutMs: number

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`)
    this.name = 'TimeoutError'
    this.timeoutMs = timeoutMs
  }
}

export class HttpError extends Error {
  readonly status: number
  readonly body: unknown
  readonly retryAfter: string | null
  readonly receivedAt: number

  constructor(status: number, statusText: string, body: unknown, retryAfter: string | null = null, receivedAt = Date.now()) {
    super(`HTTP ${status}${statusText ? ` ${statusText}` : ''}`)
    this.name = 'HttpError'
    this.status = status
    this.body = body
    this.retryAfter = retryAfter
    this.receivedAt = receivedAt
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
  const { json, timeoutMs, classifyNetworkErrors, headers: providedHeaders, ...init } = options
  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647)) {
    throw new RangeError('timeoutMs must be a positive finite number no greater than 2147483647')
  }
  const headers = new Headers(providedHeaders)

  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (json !== undefined) {
    if (init.body != null) {
      throw new Error('Provide either body or json, not both')
    }
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  const bodyInit = json === undefined ? init.body : JSON.stringify(json)
  if (classifyNetworkErrors) {
    const parsedUrl = new URL(url, typeof location === 'undefined' ? undefined : location.href)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new TypeError('Request URL must use HTTP or HTTPS')
    }
  }
  const controller = timeoutMs === undefined ? undefined : new AbortController()
  const callerSignal = init.signal
  const forwardAbort = () => {
    if (!controller?.signal.aborted) controller?.abort(callerSignal?.reason)
  }
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    if (controller) {
      if (callerSignal?.aborted) forwardAbort()
      else callerSignal?.addEventListener('abort', forwardAbort, { once: true })
      if (!controller.signal.aborted) {
        timer = setTimeout(() => {
          if (!controller.signal.aborted) controller.abort(new TimeoutError(timeoutMs!))
        }, timeoutMs)
      }
    }

    const fetchOptions: RequestInit = {
      ...init,
      ...(controller ? { signal: controller.signal } : {}),
      headers,
      body: bodyInit,
    }
    // Validate URL, method, headers and body before classifying transport failures.
    const validatedRequest = classifyNetworkErrors ? new Request(url, fetchOptions) : undefined
    const classifyTransportFailure = (error: unknown): never => {
      if (classifyNetworkErrors && error instanceof TypeError && !controller?.signal.aborted && !callerSignal?.aborted) {
        throw new NetworkError(error)
      }
      throw error
    }
    const response = await (validatedRequest ? fetch(validatedRequest) : fetch(url, fetchOptions))
      .catch(classifyTransportFailure)
    const receivedAt = Date.now()
    controller?.signal.throwIfAborted()
    const body = await readResponseBody(response).catch(classifyTransportFailure)
    // Covers late results and cancellation during asynchronous body reading.
    // Synchronous JSON parsing cannot be interrupted by a timer.
    controller?.signal.throwIfAborted()
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText, body, response.headers.get('Retry-After'), receivedAt)
    }
    return body
  } catch (error) {
    if (controller?.signal.aborted) throw controller.signal.reason
    throw error
  } finally {
    if (timer !== undefined) clearTimeout(timer)
    if (controller) callerSignal?.removeEventListener('abort', forwardAbort)
  }
}
