export interface User {
  name: string
  mobile: string
  password: string
}

const USERS_KEY = 'registeredUsers'
const SESSION_KEY = 'currentUser'

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\s+/g, '').trim()
}

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as User[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUser(): Omit<User, 'password'> | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Omit<User, 'password'>
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null
}

export function signup(name: string, mobile: string, password: string): { ok: boolean; error?: string } {
  const trimmedName = name.trim()
  const normalizedMobile = normalizeMobile(mobile)
  const trimmedPassword = password.trim()

  if (!trimmedName || !normalizedMobile || !trimmedPassword) {
    return { ok: false, error: 'يرجى ملء جميع الحقول' }
  }

  if (trimmedPassword.length < 6) {
    return { ok: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
  }

  const users = getUsers()
  if (users.some((u) => u.mobile === normalizedMobile)) {
    return { ok: false, error: 'رقم الموبايل مسجل بالفعل' }
  }

  users.push({ name: trimmedName, mobile: normalizedMobile, password: trimmedPassword })
  saveUsers(users)
  return { ok: true }
}

export function login(mobile: string, password: string): { ok: boolean; error?: string } {
  const normalizedMobile = normalizeMobile(mobile)
  const trimmedPassword = password.trim()

  if (!normalizedMobile || !trimmedPassword) {
    return { ok: false, error: 'يرجى إدخال رقم الموبايل وكلمة المرور' }
  }

  const user = getUsers().find((u) => u.mobile === normalizedMobile && u.password === trimmedPassword)
  if (!user) {
    return { ok: false, error: 'رقم الموبايل أو كلمة المرور غير صحيحة' }
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, mobile: user.mobile }))
  return { ok: true }
}

const BOOKING_SESSION_KEYS = [
  'selectedSection',
  'selectedSeats',
  'bookingDetails',
  'paymentSubmitted',
  'bookingRef',
] as const

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
  for (const key of BOOKING_SESSION_KEYS) {
    sessionStorage.removeItem(key)
  }
}
