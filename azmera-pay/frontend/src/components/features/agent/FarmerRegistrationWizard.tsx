import { useState, type ChangeEvent, type ReactNode } from 'react'
import { AxiosError } from 'axios'
import { registerFarmer } from '../../../api/farmers'
import {
  ETHIOPIAN_REGIONS,
  GENDER_OPTIONS,
  LAND_OWNERSHIP_OPTIONS,
} from '../../../data/reference'
import type {
  Farmer,
  FarmerRegistrationInput,
  Gender,
  LandOwnership,
} from '../../../types/farmer'
import { CheckIcon } from '../../ui/icons'

interface FarmerRegistrationWizardProps {
  onSuccess: (farmer: Farmer) => void
}

type FieldErrors = Record<string, string[]>

interface FormState {
  full_name: string
  phone: string
  fayda_fin: string
  gender: Gender | ''
  region: string
  woreda: string
  kebele: string
  farm_size_hectares: string
  primary_crop: string
  land_ownership: LandOwnership
  land_ownership_notes: string
}

type DocumentKey = 'farmer_id' | 'field_photo' | 'farmer_proof'

type Documents = Record<DocumentKey, File | null>

const EMPTY_FORM: FormState = {
  full_name: '',
  phone: '',
  fayda_fin: '',
  gender: '',
  region: '',
  woreda: '',
  kebele: '',
  farm_size_hectares: '',
  primary_crop: '',
  land_ownership: 'owned',
  land_ownership_notes: '',
}

const EMPTY_DOCUMENTS: Documents = {
  farmer_id: null,
  field_photo: null,
  farmer_proof: null,
}

interface Step {
  title: string
  description: string
  fields: (keyof FormState)[]
}

const STEPS: Step[] = [
  {
    title: 'Personal details',
    description: 'Identify the farmer with their name, phone and Fayda ID.',
    fields: ['full_name', 'phone', 'fayda_fin', 'gender'],
  },
  {
    title: 'Farm information',
    description: 'Where the farm is and what the farmer produces.',
    fields: [
      'region',
      'woreda',
      'kebele',
      'farm_size_hectares',
      'primary_crop',
      'land_ownership',
    ],
  },
  {
    title: 'Documents',
    description: 'Attach the supporting documents for verification.',
    fields: [],
  },
  {
    title: 'Review & submit',
    description: 'Confirm the details before submitting for verification.',
    fields: [],
  },
]

const DOCUMENT_FIELDS: {
  key: DocumentKey
  label: string
  hint: string
  accept: string
}[] = [
  {
    key: 'farmer_id',
    label: 'Farmer ID',
    hint: 'National ID or Fayda card of the farmer.',
    accept: 'image/*,.pdf',
  },
  {
    key: 'field_photo',
    label: 'Field photo of farmer',
    hint: 'A recent photo of the farmer on their field.',
    accept: 'image/*',
  },
  {
    key: 'farmer_proof',
    label: 'Proof of farming',
    hint: 'Document confirming the person is a farmer.',
    accept: 'image/*,.pdf',
  },
]

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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-stone-dark">{value}</dd>
    </div>
  )
}

function documentLabel(key: DocumentKey) {
  return DOCUMENT_FIELDS.find((field) => field.key === key)?.label ?? key
}

export default function FarmerRegistrationWizard({
  onSuccess,
}: FarmerRegistrationWizardProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [documents, setDocuments] = useState<Documents>(EMPTY_DOCUMENTS)
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

  const handleDocument =
    (key: DocumentKey) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null
      setDocuments((prev) => ({ ...prev, [key]: file }))
    }

  const validateStep = (index: number): FieldErrors => {
    const errors: FieldErrors = {}
    const current = STEPS[index]

    if (current.fields.includes('full_name') && !form.full_name.trim()) {
      errors.full_name = ['Full name is required.']
    }
    if (current.fields.includes('phone') && !form.phone.trim()) {
      errors.phone = ['Phone number is required.']
    }
    if (
      current.fields.includes('fayda_fin') &&
      form.fayda_fin.trim() &&
      !/^\d{15}$/.test(form.fayda_fin.trim())
    ) {
      errors.fayda_fin = ['Fayda FIN must be a 15-digit number.']
    }
    if (current.fields.includes('gender') && !form.gender) {
      errors.gender = ['Select a gender.']
    }
    if (current.fields.includes('region') && !form.region) {
      errors.region = ['Select a region.']
    }
    if (current.fields.includes('woreda') && !form.woreda.trim()) {
      errors.woreda = ['Woreda is required.']
    }
    if (current.fields.includes('farm_size_hectares')) {
      const size = Number(form.farm_size_hectares)
      if (!form.farm_size_hectares.trim()) {
        errors.farm_size_hectares = ['Farm size is required.']
      } else if (!Number.isFinite(size) || size <= 0) {
        errors.farm_size_hectares = ['Enter a farm size greater than 0.']
      }
    }
    if (current.fields.includes('primary_crop') && !form.primary_crop.trim()) {
      errors.primary_crop = ['Primary crop is required.']
    }
    return errors
  }

  const goNext = () => {
    const errors = validateStep(step)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const goBack = () => {
    setFieldErrors({})
    setGeneralError(null)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const stepForField = (field: string): number => {
    const index = STEPS.findIndex((item) => item.fields.includes(field as keyof FormState))
    return index === -1 ? 0 : index
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setGeneralError(null)
    setFieldErrors({})

    const payload: FarmerRegistrationInput = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      fayda_fin: form.fayda_fin.trim() || undefined,
      gender: form.gender || undefined,
      region: form.region,
      woreda: form.woreda.trim(),
      kebele: form.kebele.trim() || undefined,
      farm_size_hectares: form.farm_size_hectares.trim(),
      primary_crop: form.primary_crop.trim(),
      land_ownership: form.land_ownership,
      land_ownership_notes: form.land_ownership_notes.trim() || undefined,
    }

    try {
      const farmer = await registerFarmer(payload)
      onSuccess(farmer)
    } catch (err) {
      const { fieldErrors: apiErrors, general } = normalizeApiError(err)
      setFieldErrors(apiErrors)
      setGeneralError(general)
      const firstField = Object.keys(apiErrors)[0]
      if (firstField) setStep(stepForField(firstField))
    } finally {
      setSubmitting(false)
    }
  }

  const isReview = step === STEPS.length - 1

  return (
    <div className="rounded-2xl border border-forest/10 bg-white p-6 shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
      <ol className="mb-8 flex flex-wrap gap-x-6 gap-y-3">
        {STEPS.map((item, index) => {
          const complete = index < step
          const active = index === step
          return (
            <li key={item.title} className="flex items-center gap-2.5">
              <span
                className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                  active
                    ? 'bg-forest text-white'
                    : complete
                      ? 'bg-mint/70 text-forest-deeper'
                      : 'bg-forest/10 text-stone'
                }`}
              >
                {complete ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span
                className={`text-sm font-medium ${
                  active ? 'text-forest-deeper' : 'text-stone'
                }`}
              >
                {item.title}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mb-6">
        <h2 className="font-serif text-xl font-semibold text-forest-deeper">
          {STEPS[step].title}
        </h2>
        <p className="mt-1 text-sm text-stone">{STEPS[step].description}</p>
      </div>

      {generalError && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {generalError}
        </p>
      )}

      {step === 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="full_name" label="Full name" errors={fieldErrors}>
            <input
              id="full_name"
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
              value={form.phone}
              onChange={(event) => update('phone')(event.target.value)}
              placeholder="+251912345678"
              className={inputClasses}
            />
          </Field>

          <Field name="fayda_fin" label="Fayda FIN" errors={fieldErrors}>
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

          <Field name="gender" label="Gender" errors={fieldErrors}>
            <select
              id="gender"
              value={form.gender}
              onChange={(event) => update('gender')(event.target.value)}
              className={inputClasses}
            >
              <option value="" disabled>
                Select gender…
              </option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="region" label="Region" errors={fieldErrors}>
            <select
              id="region"
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

          <Field
            name="farm_size_hectares"
            label="Farm size (hectares)"
            errors={fieldErrors}
          >
            <input
              id="farm_size_hectares"
              type="number"
              min="0"
              step="0.01"
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
              value={form.primary_crop}
              onChange={(event) => update('primary_crop')(event.target.value)}
              placeholder="e.g. Teff"
              className={inputClasses}
            />
          </Field>

          <Field name="land_ownership" label="Land ownership" errors={fieldErrors}>
            <select
              id="land_ownership"
              value={form.land_ownership}
              onChange={(event) => update('land_ownership')(event.target.value)}
              className={inputClasses}
            >
              {LAND_OWNERSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
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
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <p className="rounded-xl border border-forest/15 bg-mint/25 px-4 py-3 text-xs leading-5 text-stone-dark">
            Attachments are captured for this review step. File upload storage is
            not wired up yet, so documents are not saved to the farmer record.
          </p>

          {DOCUMENT_FIELDS.map((doc) => (
            <div
              key={doc.key}
              className="rounded-xl border border-forest/15 p-4"
            >
              <label
                htmlFor={doc.key}
                className="block text-sm font-medium text-stone-dark"
              >
                {doc.label}
              </label>
              <p className="mt-0.5 text-xs leading-5 text-stone">{doc.hint}</p>
              <input
                id={doc.key}
                type="file"
                accept={doc.accept}
                onChange={handleDocument(doc.key)}
                className={`mt-3 block w-full text-sm text-stone file:mr-4 file:rounded-lg file:border-0 file:bg-forest/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest-deeper hover:file:bg-forest/20 ${focusRing}`}
              />
              {documents[doc.key] && (
                <p className="mt-2 text-xs font-medium text-forest">
                  {documents[doc.key]?.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {isReview && (
        <div className="space-y-6">
          <section>
            <h3 className="mb-1 font-serif text-base font-semibold text-forest-deeper">
              Personal details
            </h3>
            <dl className="grid grid-cols-1 divide-y divide-forest/5 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
              <ReviewRow label="Full name" value={form.full_name || '—'} />
              <ReviewRow label="Phone" value={form.phone || '—'} />
              <ReviewRow label="Fayda FIN" value={form.fayda_fin || 'Not provided'} />
              <ReviewRow
                label="Gender"
                value={
                  GENDER_OPTIONS.find((option) => option.value === form.gender)
                    ?.label ?? '—'
                }
              />
            </dl>
          </section>

          <section className="border-t border-forest/10 pt-4">
            <h3 className="mb-1 font-serif text-base font-semibold text-forest-deeper">
              Farm information
            </h3>
            <dl className="grid grid-cols-1 divide-y divide-forest/5 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
              <ReviewRow label="Region" value={form.region || '—'} />
              <ReviewRow label="Woreda" value={form.woreda || '—'} />
              <ReviewRow label="Kebele" value={form.kebele || 'Not provided'} />
              <ReviewRow
                label="Farm size"
                value={form.farm_size_hectares ? `${form.farm_size_hectares} ha` : '—'}
              />
              <ReviewRow label="Primary crop" value={form.primary_crop || '—'} />
              <ReviewRow
                label="Land ownership"
                value={
                  LAND_OWNERSHIP_OPTIONS.find(
                    (option) => option.value === form.land_ownership,
                  )?.label ?? '—'
                }
              />
            </dl>
          </section>

          <section className="border-t border-forest/10 pt-4">
            <h3 className="mb-1 font-serif text-base font-semibold text-forest-deeper">
              Documents
            </h3>
            <dl className="grid grid-cols-1 divide-y divide-forest/5 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
              {DOCUMENT_FIELDS.map((doc) => (
                <ReviewRow
                  key={doc.key}
                  label={documentLabel(doc.key)}
                  value={documents[doc.key]?.name ?? 'Not attached'}
                />
              ))}
            </dl>
          </section>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || submitting}
          className="rounded-xl border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest-deeper transition-colors hover:bg-mint/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {isReview ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit for verification'}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  )
}
