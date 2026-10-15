import { client } from './client'

export type SupplierProductCategory =
  | 'crop'
  | 'seed'
  | 'fertilizer'
  | 'pesticide'
  | 'other'

export interface SupplierProfile {
  company_name: string
  region: string
  woreda: string
  product_categories: SupplierProductCategory[]
}

export async function fetchSupplierProfile(): Promise<SupplierProfile> {
  const { data } = await client.get<SupplierProfile>('/supplier/profile')
  return data
}

export async function updateSupplierProfile(
  profile: Pick<
    SupplierProfile,
    'region' | 'woreda' | 'product_categories'
  >,
): Promise<SupplierProfile> {
  const { data } = await client.patch<SupplierProfile>(
    '/supplier/profile',
    profile,
  )

  return data
}
