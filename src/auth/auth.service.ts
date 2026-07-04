import { api } from '../lib/api'
import type { LoginResponseData, User, UserRole } from '../types/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export async function login(email: string, password: string): Promise<User> {
  const data = await api.post<LoginResponseData>('/login', {
    email,
    password,
  })

  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))

  return data.user
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

export function getAuthUser(): User | null {
  const user = localStorage.getItem(USER_KEY)

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user) as User
  } catch {
    logout()
    return null
  }
}

export function hasRole(roles: UserRole[]): boolean {
  const user = getAuthUser()

  if (!user) {
    return false
  }

  return roles.includes(user.role)
}