import type { AuthUser } from '../api/types'

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'currentUser'

const BOOKING_FLOW_KEYS = [
  'selectedSection',
  'selectedSectionId',
  'selectedSeats',
  'activeBookingId',
  'activeBookingRef',
] as const

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken() && getCurrentUser())
}

export function setSession(accessToken: string, user: AuthUser): void {
  sessionStorage.setItem(TOKEN_KEY, accessToken)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export function clearBookingFlow(): void {
  for (const key of BOOKING_FLOW_KEYS) {
    sessionStorage.removeItem(key)
  }
}

export function logout(): void {
  clearSession()
  clearBookingFlow()
}
