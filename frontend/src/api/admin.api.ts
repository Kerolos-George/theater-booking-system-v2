import { API_BASE_URL } from '../config/api'
import type { AdminAuthResponse, AdminBooking, AdminPaginatedBookings } from './admin-types'
import { adminRequest } from './admin-http'
import { ApiError, extractMessage } from './http'

export function adminLogin(email: string, password: string): Promise<AdminAuthResponse> {
  return fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(async (response) => {
    let data: unknown = null
    const text = await response.text()
    if (text) {
      try {
        data = JSON.parse(text) as unknown
      } catch {
        data = text
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, data, extractMessage(data, 'فشل تسجيل الدخول'))
    }

    return data as AdminAuthResponse
  })
}

export function fetchAdminBookings(params: {
  page?: number
  limit?: number
  mobile?: string
}): Promise<AdminPaginatedBookings> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.limit) search.set('limit', String(params.limit))
  if (params.mobile?.trim()) search.set('mobile', params.mobile.trim())

  const query = search.toString()
  return adminRequest<AdminPaginatedBookings>(`/admin/bookings${query ? `?${query}` : ''}`)
}

export function fetchAdminBooking(id: string): Promise<AdminBooking> {
  return adminRequest<AdminBooking>(`/admin/bookings/${id}`)
}

export function confirmAdminBooking(id: string): Promise<AdminBooking> {
  return adminRequest<AdminBooking>(`/admin/bookings/${id}/confirm`, { method: 'POST' })
}

export function cancelAdminBooking(id: string): Promise<AdminBooking> {
  return adminRequest<AdminBooking>(`/admin/bookings/${id}/cancel`, { method: 'POST' })
}

export function lookupEntryCode(code: string): Promise<AdminBooking> {
  return adminRequest<AdminBooking>('/admin/entry/lookup', {
    method: 'POST',
    body: { code },
  })
}

export function redeemEntryCode(code: string): Promise<AdminBooking> {
  return adminRequest<AdminBooking>('/admin/entry/redeem', {
    method: 'POST',
    body: { code },
  })
}
