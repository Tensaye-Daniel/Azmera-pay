import { useState, type FormEvent, type ReactNode } from 'react'
import { AxiosError } from 'axios'
import { registerFarmer, updateFarmer } from '../../../api/farmers'
import { ETHIOPIAN_REGIONS, LAND_OWNERSHIP_OPTIONS } from '../../../data/reference'
import type { Farmer, FarmerRegistrationInput } from '../../../types/farmer'

interface FarmerFormProps {
  mode: 'create' | 'edit'
  initial?: Farmer
  onSuccess: (farmer: Farmer) => void
}

type FieldErrors = Record<string, string[]>

interface FormState {
  full_name: string
  phone: string
  fayda_fin: string
  region: string
  woreda: string
  kebele: string
  farm_size_hectares: string
  primary_crop: string
  land_ownership: 'owned' | 'leased' | 'communal'
  land_ownership_notes: string
  notes: string
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2'

const inputClasses = `w-full rounded-xl border border-forest/20 bg-white px-3 py-2.5 text-sm text-stone-dark placeholder:text-stone/60 ${focusRing}`

function normalizeApiError(err: unknown): {
  fieldErrors: FieldErrors
  general: string | null
} {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data
    if (typeof data === 'object' && data !== null) {
      if ('detail' in data && typeof data.detail === 'string') {
        return { fieldErrors: {}, general: data.detail }
      }
      const fieldErrors: FieldErrors = {}
      for (const [field, message] of Object.entries(data)) {
        if (Array.isArray(message)) {
          fieldErrors[field] = message.map(String)
        } else if (typeof message === 'string') {
          fieldErrors[field] = [message]
        }
      }
      return { fieldErrors, general: null }
    }
  }
  return { fieldErrors: {}, general: 'Something went wrong. Please try again.' }
}

function FieldError({
  name,
  errors,
}: {
  name: string
  errors: FieldErrors
}) {
  const messages = errors[name]
  if (!messages) return null
  return (
    <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">
      {messages.join(' ')}
    </p>
  )
}

function Field({
  name,
  label,
  hint,
  errors,
  children,
}: {
  name: string
  label: string
  hint?: string
  errors: FieldErrors
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-stone-dark"
      >
        {label}
      </label>
      {children}
      <FieldError name={name} errors={errors} />
      {hint && <p className="mt-1.5 text-xs leading-5 text-stone">{hint}</p>}
    </div>
  )
}

export default function FarmerForm({
  mode,
  initial,
  onSuccess,
}: FarmerFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          full_name: initial.full_name,
          phone: initial.phone,
          fayda_fin: initial.fayda_fin ?? '',
          region: initial.region,
          woreda: initial.woreda,
          kebele: initial.kebele,
          farm_size_hectares: initial.farm_size_hectares,
          primary_crop: initial.primary_crop,
          land_ownership: initial.land_ownership,
          land_ownership_notes: initial.land_ownership_notes,
          notes: initial.notes,
        }
      : {
          full_name: '',
          phone: '',
          fayda_fin: '',
          region: '',
          woreda: '',
          kebele: '',
          farm_size_hectares: '',
          primary_crop: '',
          land_ownership: 'owned',
          land_ownership_notes: '',
          notes: '',
        },
  )
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setGeneralError(null)
    setFieldErrors({})

    const payload: FarmerRegistrationInput = {
      full_name: form.full_name,
      phone: form.phone,
      fayda_fin: form.fayda_fin || undefined,
      region: form.region,
      woreda: form.woreda,
      kebele: form.kebele || undefined,
      farm_size_hectares: form.farm_size_hectares,
      primary_crop: form.primary_crop,
      land_ownership: form.land_ownership,
      land_ownership_notes: form.land_ownership_notes || undefined,
      notes: form.notes || undefined,
    }

    try {
      const saved =
        mode === 'edit' && initial
          ? await updateFarmer(initial.id, payload)
          : await registerFarmer(payload)
      onSuccess(saved)
    } catch (err) {
      const { fieldErrors: fieldErrorsFromApi, general } = normalizeApiError(err)
      setFieldErrors(fieldErrorsFromApi)
      setGeneralError(general)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-forest/10 bg-white p-6 shadow-[0_4px_20px_rgba(22,95,48,0.04)]"
    >
      {generalError && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {generalError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="full_name" label="Full name" errors={fieldErrors}>
          <input
            id="full_name"
            required
            value={form.full_name}
            onChange={(event) => update('full_name')(event.target.value)}
            className={inputClasses}
          />
        </Field>

        <Field
          name="phone"
          label="Phone number"
          hint="Any Ethiopian format - normalised to +251…"
          errors={fieldErrors}
        >
          <input
            id="phone"
            type="tel"
            required
            value={form.phone}
            onChange={(event) => update('phone')(event.target.value)}
            placeholder="+251912345678"
            className={inputClasses}
          />
        </Field>

        <Field name="fayda_fin" label="Fayda FIN (optional)" errors={fieldErrors}>
          <input
            id="fayda_fin"
            inputMode="numeric"
            maxLength={15}
            value={form.fayda_fin}
            onChange={(event) => update('fayda_fin')(event.target.value)}
            placeholder="15-digit national ID number"
            className={inputClasses}
          />
        </Field>

        <Field name="region" label="Region" errors={fieldErrors}>
          <select
            id="region"
            required
            value={form.region}
            onChange={(event) => update('region')(event.target.value)}
            className={inputClasses}
          >
            <option value="" disabled>
              Select region…
            </option>
            {ETHIOPIAN_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </Field>

        <Field name="woreda" label="Woreda" errors={fieldErrors}>
          <input
            id="woreda"
            required
            value={form.woreda}
            onChange={(event) => update('woreda')(event.target.value)}
            className={inputClasses}
          />
        </Field>

        <Field name="kebele" label="Kebele (optional)" errors={fieldErrors}>
          <input
            id="kebele"
            value={form.kebele}
            onChange={(event) => update('kebele')(event.target.value)}
            className={inputClasses}
          />
        </Field>

        <Field name="farm_size_hectares" label="Farm size (hectares)" errors={fieldErrors}>
          <input
            id="farm_size_hectares"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.farm_size_hectares}
            onChange={(event) =>
              update('farm_size_hectares')(event.target.value)
            }
            placeholder="0.00"
            className={inputClasses}
          />
        </Field>

        <Field name="primary_crop" label="Primary crop" errors={fieldErrors}>
          <input
            id="primary_crop"
            required
            value={form.primary_crop}
            onChange={(event) => update('primary_crop')(event.target.value)}
            placeholder="e.g. Teff"
            className={inputClasses}
          />
        </Field>

        <Field name="land_ownership" label="Land ownership" errors={fieldErrors}>
          <select
            id="land_ownership"
            required
            value={form.land_ownership}
            onChange={(event) =>
              update('land_ownership')(event.target.value)
            }
            className={inputClasses}
          >
            {LAND_OWNERSHIP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="land_ownership_notes"
          label="Land ownership notes (optional)"
          errors={fieldErrors}
        >
          <input
            id="land_ownership_notes"
            value={form.land_ownership_notes}
            onChange={(event) =>
              update('land_ownership_notes')(event.target.value)
            }
            className={inputClasses}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field name="notes" label="Notes (optional)" errors={fieldErrors}>
            <textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(event) => update('notes')(event.target.value)}
              className={inputClasses}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? 'Saving…'
            : mode === 'edit'
              ? 'Save changes'
              : 'Register farmer'}
        </button>
      </div>
    </form>
  )
}