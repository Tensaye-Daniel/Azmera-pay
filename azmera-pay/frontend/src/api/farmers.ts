import { client } from './client'
import type {
  AgentSummary,
  Farmer,
  FarmerRegistrationInput,
  Paginated,
} from '../types/farmer'

export async function listFarmers(): Promise<Paginated<Farmer>> {
  const { data } = await client.get<Paginated<Farmer>>(
  '/dashboard/agent/farmers',
  )
  return data
}

export async function getAgentSummary(): Promise<AgentSummary> {
  const { data } = await client.get<AgentSummary>(
    '/dashboard/agent/farmers/summary',
  )
  return data
}

export async function registerFarmer(
  input: FarmerRegistrationInput,
): Promise<Farmer> {
  const { data } = await client.post<Farmer>('/dashboard/agent/farmers', input)
  return data
}

export async function getFarmer(id: string): Promise<Farmer> {
  const { data } = await client.get<Farmer>(
    `/dashboard/agent/farmers/${id}`,
  )
  return data
}

export async function updateFarmer(
  id: string,
  input: Partial<FarmerRegistrationInput>,
): Promise<Farmer> {
  const { data } = await client.patch<Farmer>(
    `/dashboard/agent/farmers/${id}`,
    input,
  )
  return data
}