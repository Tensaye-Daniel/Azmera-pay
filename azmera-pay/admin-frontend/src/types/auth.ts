export type Role = 'agent' | 'farmer' | 'supplier' | 'buyer' | 'admin'

export type SupplierApprovalStatus =
  | 'not_required'
  | 'pending'
  | 'approved'
  | 'rejected'

export interface User {
  id: string
  phone: string
  email: string | null
  full_name: string
  role: Role
  supplier_approval_status: SupplierApprovalStatus
}

export interface LoginResponse {
  access: string
  refresh: string
}

export interface TokenRefreshResponse {
  access: string
}
