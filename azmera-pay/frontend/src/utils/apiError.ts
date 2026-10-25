import { AxiosError } from 'axios'

export interface NormalizedApiError {
  fieldErrors: Record<string, string>
  general: string | null
}

// Turns a DRF error response into per-field messages plus an optional general
// message. Field values are joined so the UI can render a single string.
export function normalizeApiError(err: unknown): NormalizedApiError {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data
    if (typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>
      const fieldErrors: Record<string, string> = {}
      for (const [field, message] of Object.entries(record)) {
        if (field === 'detail' || field === 'non_field_errors') continue
        if (Array.isArray(message)) {
          fieldErrors[field] = message.map(String).join(' ')
        } else if (typeof message === 'string') {
          fieldErrors[field] = message
        }
      }

      const generalSource = record.detail ?? record.non_field_errors
      const general = Array.isArray(generalSource)
        ? generalSource.map(String).join(' ')
        : typeof generalSource === 'string'
          ? generalSource
          : null

      return { fieldErrors, general }
    }
  }
  return { fieldErrors: {}, general: 'Something went wrong. Please try again.' }
}
