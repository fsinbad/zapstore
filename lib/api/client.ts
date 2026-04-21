/**
 * Typed fetch wrapper for ZapStore API routes.
 * All API calls go through this to ensure consistent error handling
 * and auth header injection.
 */

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | undefined>
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let getAccessTokenFn: (() => Promise<string | null>) | null = null

/** Called once from PrivyProvider to provide the token getter */
export function setAccessTokenProvider(fn: () => Promise<string | null>) {
  getAccessTokenFn = fn
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetch the auth header, retrying if the token is not yet available.
 * Handles two race conditions:
 *   1. setAccessTokenProvider hasn't been called yet (Privy still initialising)
 *   2. getAccessToken() returns null on the first render before Privy hydrates
 * Retries up to 3 times with 300ms between attempts before giving up.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (getAccessTokenFn) {
      const token = await getAccessTokenFn()
      if (token) return { Authorization: `Bearer ${token}` }
    }
    if (attempt < 2) await sleep(300)
  }
  return {}
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })
  }
  return url.toString()
}

async function doFetch(url: string, options: RequestInit): Promise<Response> {
  const res = await fetch(url, options)

  // On 401, refresh the token once and retry
  if (res.status === 401) {
    const freshHeaders = await getAuthHeaders()
    return fetch(url, {
      ...options,
      headers: { ...options.headers, ...freshHeaders },
    })
  }

  return res
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options
  const authHeaders = await getAuthHeaders()
  const url = buildUrl(path, params)

  const res = await doFetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...fetchOptions.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(body.error || 'Request failed', res.status)
  }

  return res.json()
}

/** Upload form data (no Content-Type — browser sets multipart boundary) */
async function upload<T>(path: string, formData: FormData): Promise<T> {
  const authHeaders = await getAuthHeaders()

  const res = await doFetch(path, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(body.error || 'Upload failed', res.status)
  }

  return res.json()
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  upload: <T>(path: string, formData: FormData) =>
    upload<T>(path, formData),
}

export { ApiError }
