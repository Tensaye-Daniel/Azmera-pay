import { client } from './client'
import type {
  AgentSummary,
  Farmer,
  FarmerDocumentUploads,
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
  documents: FarmerDocumentUploads = {},
): Promise<Farmer> {
  const uploads = Object.entries(documents).filter(
    (entry): entry is [string, File] => entry[1] instanceof File,
  )

  if (uploads.length === 0) {
    const { data } = await client.post<Farmer>(
      '/dashboard/agent/farmers',
      input,
    )
    return data
  }

  const form = new FormData()
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, String(value))
    }
  }
  for (const [key, file] of uploads) {
    form.append(key, file)
  }

  const { data } = await client.post<Farmer>(
    '/dashboard/agent/farmers',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
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