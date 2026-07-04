export type UserRole =
  | 'admin'
  | 'institution'
  | 'enviroserve_staff'
  | 'driver'
  | 'finance_officer'

export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  phone?: string | null
  address?: string | null
  institution_name?: string | null
  institution_type?: string | null
  staff_code?: string | null
  staff_position?: string | null
  wallet_balance?: string | number
  points_balance?: number
}

export interface LoginResponseData {
  token: string
  token_type: string
  user: User
}