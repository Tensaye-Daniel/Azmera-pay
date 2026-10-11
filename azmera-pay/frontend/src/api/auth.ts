import { client } from './client'
import type { LoginResponse, User } from '../types/auth'

export async function login(phone: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/auth/login', {
    phone,
    password,
  })
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await client.get<User>('/auth/me')
  return data
}