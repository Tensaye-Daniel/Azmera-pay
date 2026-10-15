import { client } from './client'
import type { LoginResponse, User } from '../types/auth'

export interface AgentRegisterInput {
  full_name: string
  phone: string
  password: string
  email?: string
}

export interface AgentRegisterResult {
  id: string
  full_name: string
  phone: string
}

export interface SupplierRegisterInput {
  full_name: string
  phone: string
  tin_number: string
  company_name: string
  password: string
  email?: string
}

export interface SupplierRegisterResult {
  id: string
  full_name: string
  phone: string
  email: string | null
  role: 'supplier'
  supplier_approval_status: 'pending'
  message: string
}

export async function login(phone: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/auth/login', {
    phone,
    password,
  })
  return data
}

export async function registerAgent(
  input: AgentRegisterInput,
): Promise<AgentRegisterResult> {
  const { data } = await client.post<AgentRegisterResult>('/auth/register', input)
  return data
}

export async function registerSupplier(
  input: SupplierRegisterInput,
): Promise<SupplierRegisterResult> {
  const { data } = await client.post<SupplierRegisterResult>(
    '/auth/register/supplier',
    input,
  )
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await client.get<User>('/auth/me')
  return data
}
