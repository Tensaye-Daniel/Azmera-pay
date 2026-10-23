import type { AxiosResponse } from 'axios'

import { client } from './client'

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

export type ListingInput = Pick<
  SupplierListing,
  'available_quantity' | 'unit' | 'unit_price' | 'region' | 'woreda' | 'availability_status' | 'notes'
> & { name: string; category: SupplierProductCategory }

type Paginated<T> = { results: T[]; count: number; next: string | null; previous: string | null }
type SupplierListingPage = SupplierListing[] | Paginated<SupplierListing>

export async function fetchSupplierListings(): Promise<SupplierListing[]> {
  const listings: SupplierListing[] = []
  const visitedPages = new Set<string>()
  let nextPage: string | null = '/catalog/supplier/listings'
  const apiBasePath = '/api/v1'
  const listingEndpoint = `${window.location.origin}${apiBasePath}/catalog/supplier/listings`

  while (nextPage) {
    const pageUrl = new URL(nextPage, listingEndpoint)
    if (!pageUrl.pathname.startsWith(`${apiBasePath}/`)) {
      throw new Error('Supplier listing pagination returned a URL outside the API.')
    }
    const apiPath = `${pageUrl.pathname.slice(apiBasePath.length)}${pageUrl.search}`
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
