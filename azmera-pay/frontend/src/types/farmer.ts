export type FarmerStatus = 'registered' | 'unverified'

export type LandOwnership = 'owned' | 'leased' | 'communal'

export interface Farmer {
  id: string
  user_id: string
  full_name: string
  phone: string
  azmera_account_number: string
  fayda_fin: string | null
  region: string
  woreda: string
  kebele: string
  farm_size_hectares: string
  primary_crop: string
  land_ownership: LandOwnership
  land_ownership_notes: string
  notes: string
  status: FarmerStatus
  registered_by_id: string
  created_at: string
  updated_at: string
}

export interface FarmerRegistrationInput {
  full_name: string
  phone: string
  fayda_fin?: string
  region: string
  woreda: string
  kebele?: string
  farm_size_hectares: string
  primary_crop: string
  land_ownership: LandOwnership
  land_ownership_notes?: string
  notes?: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}