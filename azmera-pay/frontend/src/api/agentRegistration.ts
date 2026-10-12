// Agent sign-up API service.
//
// The ONLY confirmed registration endpoint is POST /api/v1/auth/register
// (backend/apps/accounts/urls.py -> AgentRegisterSerializer). It really creates
// an AGENT account and persists exactly the fields below.
//
// The wizard collects more than that endpoint supports (identity, area and
// employment details). Those fields are NOT sent to the API - no endpoint is
// invented for them and nothing pretends they were stored. They are reported
// back as `pendingReviewFields` so the UI can be explicit with the user.

import { registerAgent } from './auth'
import type {
  AgentRegistrationFormData,
  AgentRegistrationResult,
} from '../types/agentRegistration'

/** Fields the backend actually persists today. */
export const PERSISTED_FIELDS = [
  'full_name',
  'phone',
  'email',
  'password',
] as const

/** Collected by the wizard but not yet persisted by the API. */
export const PENDING_REVIEW_FIELDS = [
  'date_of_birth',
  'gender',
  'region',
  'local_area',
  'id_type',
  'id_number',
  'id_document',
  'operating_region',
  'agent_number',
  'organization',
] as const

export async function submitAgentRegistration(
  form: AgentRegistrationFormData,
): Promise<AgentRegistrationResult> {
  const account = await registerAgent({
    full_name: form.fullName.trim(),
    phone: form.phone.trim(),
    password: form.password,
    email: form.email.trim() || undefined,
  })

  return {
    id: account.id,
    fullName: account.full_name,
    phone: account.phone,
    email: form.email.trim() || null,
    persistedFields: [...PERSISTED_FIELDS],
    pendingReviewFields: [...PENDING_REVIEW_FIELDS],
  }
}
