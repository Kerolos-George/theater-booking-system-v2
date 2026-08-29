import { API_BASE_URL } from '../config/api'
import { clearSession, getAccessToken } from '../auth/session'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, fallbackMessage: string) {
    super(extractMessage(body, fallbackMessage))
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function extractMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback

  const record = body as Record<string, unknown>
  const message = record.message

  if (typeof message === 'string') return message
  if (Array.isArray(message)) return message.map(String).join('، ')
  if (message && typeof message === 'object' && 'message' in message) {
    return String((message as { message: unknown }).message)
  }

  return fallback
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  auth?: boolean
  body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, body, headers, ...rest } = options

  const requestHeaders = new Headers(headers)

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getAccessToken()
    if (!token) throw new ApiError(401, null, 'يرجى تسجيل الدخول')
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  let data: unknown = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }

  if (response.status === 401 && auth) {
    clearSession()
    window.location.hash = '#/login'
  }

  if (!response.ok) {
    throw new ApiError(response.status, data, 'حدث خطأ في الاتصال بالخادم')
  }

  return data as T
}
