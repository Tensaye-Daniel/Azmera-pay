export type FarmerStatus = 'registered' | 'pending' | 'unverified'

export type Gender = 'male' | 'female'

export type LandOwnership = 'owned' | 'leased' | 'communal'

export type FarmerDocumentType =
  | 'farmer_id'
  | 'field_photo'
  | 'farming_proof'
  | 'other'

export interface FarmerDocument {
  id: string
  document_type: FarmerDocumentType
  document_type_display: string
  original_filename: string
  content_type: string
  size_bytes: number
  checksum: string
  created_at: string
}

export interface Farmer {
  id: string
  user_id: string
  full_name: string
  phone: string
  azmera_account_number: string
  fayda_fin: string | null
  gender: Gender | ''
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
  documents: FarmerDocument[]
  created_at: string
  updated_at: string
}

export interface FarmerRegistrationInput {
  full_name: string
  phone: string
  fayda_fin?: string
  gender?: Gender | ''
  region: string
  woreda: string
  kebele?: string
  farm_size_hectares: string
  primary_crop: string
  land_ownership: LandOwnership
  land_ownership_notes?: string
  notes?: string
}

export type FarmerDocumentUploads = Partial<
  Record<'farmer_id' | 'field_photo' | 'farming_proof', File>
>

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AgentSummary {
  total: number
  by_status: Record<FarmerStatus, number>
  recent: Farmer[]
}