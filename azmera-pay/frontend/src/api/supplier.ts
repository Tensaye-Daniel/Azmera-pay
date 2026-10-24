import { isAxiosError, type AxiosResponse } from 'axios'

import { client } from './client'
import { supplierListingApiPath } from './supplier-pagination'

export type ListingStatus = 'active' | 'paused' | 'inactive' | 'expired'

export interface SupplierProduct {
  id: string
  name: string
  category: SupplierProductCategory
}

export interface SupplierUnit {
  id: string
  name: string
  code: string
}

export interface SupplierListing {
  id: string
  product: string
  product_name: string
  product_category?: SupplierProductCategory
  available_quantity: string
  unit: string
  unit_code: string
  unit_price: string
  region: string
  woreda: string
  availability_status: ListingStatus
  notes: string
  created_at: string
  updated_at: string
}

export interface SupplierInventorySummary {
  total: number
  active: number
  paused: number
  inactive: number
}

export interface SupplierMatch {
  id: string
  request_id: string
  request_status: 'open' | 'matched'
  listing_id: string
  listing_product: string
  listing_region: string
  listing_woreda: string
  requested_product: string
  requested_category: SupplierProductCategory
  requested_quantity: string
  requested_unit: string
  request_region: string
  request_woreda: string
  rank: number
  status: 'pending'
  created_at: string
}

export async function fetchSupplierMatches(): Promise<SupplierMatch[]> {
  const { data } = await client.get<SupplierMatch[]>('/matching/supplier/matches/')
  return data
}

export type ListingInput = Pick<
  SupplierListing,
  'available_quantity' | 'unit' | 'unit_price' | 'region' | 'woreda' | 'availability_status' | 'notes'
> & { name: string; category: SupplierProductCategory }

type Paginated<T> = { results: T[]; count: number; next: string | null; previous: string | null }
type SupplierListingPage = SupplierListing[] | Paginated<SupplierListing>

export async function fetchSupplierListings(): Promise<SupplierListing[]> {
  const listings: SupplierListing[] = []
  const visitedPages = new Set<string>()
  const apiBasePath = '/api/v1'
  let nextPage: string | null = `${apiBasePath}/catalog/supplier/listings`
  const listingEndpoint = `${window.location.origin}${apiBasePath}/catalog/supplier/listings`

  while (nextPage) {
    const apiPath = supplierListingApiPath(
      nextPage,
      listingEndpoint,
      apiBasePath,
    )
    if (visitedPages.has(apiPath)) {
      throw new Error('Supplier listing pagination returned a repeated page URL.')
    }
    visitedPages.add(apiPath)

    const pageResponse: AxiosResponse<SupplierListingPage> = await client.get<SupplierListingPage>(
      apiPath,
    )
    const pageData: SupplierListingPage = pageResponse.data

    if (Array.isArray(pageData)) {
      listings.push(...pageData)
      break
    }

    listings.push(...pageData.results)
    nextPage = pageData.next
  }

  return listings
}

export async function fetchSupplierInventorySummary(): Promise<SupplierInventorySummary> {
  const { data } = await client.get<SupplierInventorySummary>(
    '/catalog/supplier/inventory-summary',
  )
  return data
}

export async function fetchSupplierProducts(): Promise<SupplierProduct[]> {
  const { data } = await client.get<SupplierProduct[]>('/catalog/products')
  return data
}

export async function fetchSupplierUnits(): Promise<SupplierUnit[]> {
  const { data } = await client.get<SupplierUnit[]>('/catalog/units')
  return data
}

export async function saveSupplierListing(input: ListingInput, id?: string): Promise<SupplierListing> {
  const { data } = id
    ? await client.patch<SupplierListing>(`/catalog/supplier/listings/${id}`, input)
    : await client.post<SupplierListing>('/catalog/supplier/listings', input)
  return data
}

export async function deleteSupplierListing(id: string): Promise<void> {
  await client.delete(`/catalog/supplier/listings/${id}`)
}

export async function updateSupplierListingStatus(
  id: string,
  availability_status: Exclude<ListingStatus, 'expired'>,
): Promise<SupplierListing> {
  const { data } = await client.patch<SupplierListing>(
    `/catalog/supplier/listings/${id}`,
    { availability_status },
  )
  return data
}

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

export function supplierApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback

  const data: unknown = error.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const values = Object.values(data as Record<string, unknown>)
    for (const value of values) {
      const messages = Array.isArray(value) ? value : [value]
      const message = messages.find(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
      if (message) return message
    }
  }

  return fallback
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
