import { API_BASE_URL } from '../config/api'
import { clearAdminSession, getAdminToken } from '../admin/session'
import { ApiError, extractMessage } from './http'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export async function adminRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const requestHeaders = new Headers(headers)

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const token = getAdminToken()
  if (!token) throw new ApiError(401, null, 'يرجى تسجيل دخول الإدارة')
  requestHeaders.set('Authorization', `Bearer ${token}`)

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

  if (response.status === 401) {
    clearAdminSession()
    window.location.hash = '#/admin/login'
  }

  if (!response.ok) {
    throw new ApiError(response.status, data, extractMessage(data, 'حدث خطأ في الاتصال بالخادم'))
  }

  return data as T
}
