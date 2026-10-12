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
      if ('detail' in data && typeof data.detail === 'string') {
        return { fieldErrors: {}, general: data.detail }
      }
      const fieldErrors: Record<string, string> = {}
      for (const [field, message] of Object.entries(data)) {
        if (Array.isArray(message)) {
          fieldErrors[field] = message.map(String).join(' ')
        } else if (typeof message === 'string') {
          fieldErrors[field] = message
        }
      }
      return { fieldErrors, general: null }
    }
  }
  return { fieldErrors: {}, general: 'Something went wrong. Please try again.' }
}
