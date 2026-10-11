export type Role = 'agent' | 'farmer' | 'supplier' | 'buyer' | 'admin'

export interface User {
  id: string
  phone: string
  email: string | null
  full_name: string
  role: Role
}

export interface LoginResponse {
  access: string
  refresh: string
}

export interface TokenRefreshResponse {
  access: string
}