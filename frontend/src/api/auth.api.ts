import { apiRequest } from './http'
import type { AuthResponse } from './types'
import { setSession } from '../auth/session'

export async function login(mobile: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/user/auth/login', {
    method: 'POST',
    body: { mobile, password },
  })
  setSession(response.accessToken, response.user)
  return response
}

export async function signup(
  name: string,
  mobile: string,
  password: string,
  confirmPassword: string,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/user/auth/signup', {
    method: 'POST',
    body: { name, mobile, password, confirmPassword },
  })
  setSession(response.accessToken, response.user)
  return response
}

export async function fetchProfile() {
  return apiRequest<{ id: string; name: string; mobile: string; createdAt: string }>('/user/auth/me', {
    auth: true,
  })
}
