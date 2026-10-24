import { client } from './client'
import type { Paginated } from '../types/common'

export type UserRole =
  | 'agent'
  | 'farmer'
  | 'supplier'
  | 'buyer'
  | 'admin'

export type SupplierApprovalStatus =
  | 'not_required'
  | 'pending'
  | 'approved'
  | 'rejected'

export type FarmerStatus = 'registered' | 'pending' | 'unverified'

export interface AdminUser {
  id: string
  phone: string
  email: string | null
  full_name: string
  role: UserRole
  supplier_approval_status: SupplierApprovalStatus
  is_active: boolean
  is_staff: boolean
}

export interface AdminSupplier {
  id: string
  user_id: string
  phone: string
  full_name: string
  email: string | null
  company_name: string
  tin_number: string
  region: string
  woreda: string
  product_categories: string[]
  supplier_approval_status: SupplierApprovalStatus
  is_active: boolean
}

export type FarmerDocumentType =
  | 'farmer_id'
  | 'field_photo'
  | 'farming_proof'
  | 'other'

export interface AdminFarmerDocument {
  id: string
  document_type: FarmerDocumentType
  document_type_display: string
  original_filename: string
  content_type: string
  size_bytes: number
  checksum: string
  created_at: string
}

export interface AdminFarmer {
  id: string
  user_id: string
  azmera_account_number: string
  full_name: string
  phone: string
  email: string | null
  gender: string
  region: string
  woreda: string
  kebele: string
  farm_size_hectares: string
  primary_crop: string
  land_ownership: string
  land_ownership_notes: string
  fayda_fin: string | null
  status: FarmerStatus
  notes: string
  registered_by_name: string | null
  registered_by_phone: string | null
  documents: AdminFarmerDocument[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminSummary {
  users: {
    total: number
    by_role: Record<UserRole, number>
  }
  farmers: {
    total: number
    by_status: Record<FarmerStatus, number>
  }
  suppliers: {
    total: number
    by_approval: Record<SupplierApprovalStatus, number>
  }
}

export async function getAdminSummary() {
  const { data } = await client.get<AdminSummary>('/dashboard/admin/users/summary')
  return data
}

export async function listAdminUsers(params: Record<string, string> = {}) {
  const { data } = await client.get<Paginated<AdminUser>>(
    '/dashboard/admin/users',
    { params },
  )
  return data.results
}

export async function updateAdminUser(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await client.patch<AdminUser>(
    `/dashboard/admin/users/${id}/status`,
    payload,
  )
  return data
}

export async function listAdminSuppliers(params: Record<string, string> = {}) {
  const { data } = await client.get<Paginated<AdminSupplier>>(
    '/dashboard/admin/suppliers',
    { params },
  )
  return data.results
}

export async function approveSupplier(id: string) {
  const { data } = await client.patch<AdminSupplier>(
    `/dashboard/admin/suppliers/${id}/approve`,
  )
  return data
}

export async function rejectSupplier(id: string) {
  const { data } = await client.patch<AdminSupplier>(
    `/dashboard/admin/suppliers/${id}/reject`,
  )
  return data
}

export async function activateSupplier(id: string) {
  const { data } = await client.patch<AdminSupplier>(
    `/dashboard/admin/suppliers/${id}/activate`,
  )
  return data
}

export async function deactivateSupplier(id: string) {
  const { data } = await client.patch<AdminSupplier>(
    `/dashboard/admin/suppliers/${id}/deactivate`,
  )
  return data
}

export async function listAdminFarmers(params: Record<string, string> = {}) {
  const { data } = await client.get<Paginated<AdminFarmer>>(
    '/dashboard/admin/farmers',
    { params },
  )
  return data.results
}

export async function getAdminFarmer(id: string) {
  const { data } = await client.get<AdminFarmer>(
    `/dashboard/admin/farmers/${id}`,
  )
  return data
}

export async function downloadFarmerDocument(
  farmerId: string,
  documentId: string,
) {
  const { data } = await client.get<Blob>(
    `/dashboard/admin/farmers/${farmerId}/documents/${documentId}`,
    { responseType: 'blob' },
  )
  return data
}

export async function verifyFarmer(id: string) {
  const { data } = await client.patch<AdminFarmer>(
    `/dashboard/admin/farmers/${id}/verify`,
  )
  return data
}

export async function markFarmerPending(id: string) {
  const { data } = await client.patch<AdminFarmer>(
    `/dashboard/admin/farmers/${id}/pending`,
  )
  return data
}

export async function unverifyFarmer(id: string) {
  const { data } = await client.patch<AdminFarmer>(
    `/dashboard/admin/farmers/${id}/unverify`,
  )
  return data
}

export async function activateFarmer(id: string) {
  const { data } = await client.patch<AdminFarmer>(
    `/dashboard/admin/farmers/${id}/activate`,
  )
  return data
}

export async function deactivateFarmer(id: string) {
  const { data } = await client.patch<AdminFarmer>(
    `/dashboard/admin/farmers/${id}/deactivate`,
  )
  return data
}
