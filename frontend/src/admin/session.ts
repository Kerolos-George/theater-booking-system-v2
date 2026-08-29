import type { AdminUser } from '../api/admin-types'

const TOKEN_KEY = 'adminAccessToken'
const ADMIN_KEY = 'adminUser'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getAdminUser(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken() && getAdminUser())
}

export function setAdminSession(accessToken: string, admin: AdminUser): void {
  sessionStorage.setItem(TOKEN_KEY, accessToken)
  sessionStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(ADMIN_KEY)
}

export function adminLogout(): void {
  clearAdminSession()
}
