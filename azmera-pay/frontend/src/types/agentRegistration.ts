// Shape of the multi-step Azmera agent sign-up form. Field names are camelCase
// for the UI; the API service maps the subset the backend persists.

import type { Gender } from './farmer'

export type { Gender }

export type IdType =
  | 'national_id'
  | 'kebele_id'
  | 'passport'
  | 'drivers_license'

export interface AgentRegistrationFormData {
  // Step 1 - personal information
  fullName: string
  phone: string
  email: string
  dateOfBirth: string
  gender: Gender | ''
  region: string
  localArea: string

  // Step 2 - identity verification
  idType: IdType | ''
  idNumber: string
  idDocument: File | null

  // Step 3 - agent details
  operatingRegion: string
  agentNumber: string
  organization: string

  // Step 4 - account security
  password: string
  confirmPassword: string
  acceptedTerms: boolean
}

export const EMPTY_AGENT_FORM: AgentRegistrationFormData = {
  fullName: '',
  phone: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  region: '',
  localArea: '',
  idType: '',
  idNumber: '',
  idDocument: null,
  operatingRegion: '',
  agentNumber: '',
  organization: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

export interface AgentRegistrationResult {
  id: string
  fullName: string
  phone: string
  email: string | null
  /** Fields the confirmed backend endpoint actually persisted. */
  persistedFields: string[]
  /** Collected in the UI but not yet stored by the backend; queued for review. */
  pendingReviewFields: string[]
}
