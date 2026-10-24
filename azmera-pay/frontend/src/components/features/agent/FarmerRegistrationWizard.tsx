import { useState, type ReactNode } from 'react'
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
import { normalizeApiError } from '../../../utils/apiError'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import FileUpload from '../../ui/FileUpload'
import Notice from '../../ui/Notice'
import ProgressSteps from '../../ui/ProgressSteps'
import Select from '../../ui/Select'
import TextInput from '../../ui/TextInput'
import Textarea from '../../ui/Textarea'
import {
  CheckCircleIcon,
  DocumentIcon,
  PhoneIcon,
  SproutIcon,
  UsersIcon,
} from '../../ui/icons'

interface FarmerRegistrationWizardProps {
  onSuccess: (farmer: Farmer) => void
}

type FieldErrors = Record<string, string>

interface FormState {
  full_name: string
  phone: string
  gender: Gender | ''
  fayda_fin: string
  region: string
  woreda: string
  kebele: string
  farm_size_hectares: string
  primary_crop: string
  land_ownership: LandOwnership
  land_ownership_notes: string
}

const EMPTY_FORM: FormState = {
  full_name: '',
  phone: '',
  gender: '',
  fayda_fin: '',
  region: '',
  woreda: '',
  kebele: '',
  farm_size_hectares: '',
  primary_crop: '',
  land_ownership: 'owned',
  land_ownership_notes: '',
}

type DocumentKey = 'farmer_id' | 'field_photo' | 'farming_proof'

type Documents = Record<DocumentKey, File | null>

const EMPTY_DOCUMENTS: Documents = {
  farmer_id: null,
  field_photo: null,
  farming_proof: null,
}

const DOCUMENT_FIELDS: {
  key: DocumentKey
  label: string
  hint: string
}[] = [
  {
    key: 'farmer_id',
    label: 'Farmer ID',
    hint: 'National ID, Fayda card, or kebele ID.',
  },
  {
    key: 'field_photo',
    label: 'Farm field photo',
    hint: 'A photo of the farm or main plot.',
  },
  {
    key: 'farming_proof',
    label: 'Proof of farming',
    hint: 'Land certificate, lease, or cooperative letter.',
  },
]

interface Step {
  title: string
  heading: string
  description: string
  fields: (keyof FormState)[]
}

const STEPS: (Step & { icon: typeof UsersIcon })[] = [
  {
    title: 'Farmer',
    heading: 'Farmer details',
    description: 'Identify the farmer you are registering.',
    fields: ['full_name', 'phone', 'gender', 'fayda_fin'],
    icon: UsersIcon,
  },
  {
    title: 'Farm',
    heading: 'Farm information',
    description: 'Where the farm is and what the farmer produces.',
    fields: [
      'region',
      'woreda',
      'kebele',
      'farm_size_hectares',
      'primary_crop',
      'land_ownership',
    ],
    icon: SproutIcon,
  },
  {
    title: 'Documents',
    heading: 'Supporting documents',
    description: 'Attach the farmer\u2019s identity and farming evidence.',
    fields: [],
    icon: DocumentIcon,
  },
  {
    title: 'Review',
    heading: 'Review & submit',
    description: 'Confirm the details before submitting for verification.',
    fields: [],
    icon: CheckCircleIcon,
  },
]

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-stone">{label}</dt>
      <dd className="text-right text-sm font-medium text-stone-dark">{value}</dd>
    </div>
  )
}

function ReviewSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-forest/10 bg-white p-5">
      <h3 className="font-serif text-base font-semibold text-forest-deeper">
        {title}
      </h3>
      <dl className="mt-2 divide-y divide-forest/5">{children}</dl>
    </section>
  )
}

export default function FarmerRegistrationWizard({
  onSuccess,
}: FarmerRegistrationWizardProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [documents, setDocuments] = useState<Documents>(EMPTY_DOCUMENTS)

  const update = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const setDocument = (key: DocumentKey) => (file: File | null) => {
    setDocuments((prev) => ({ ...prev, [key]: file }))
    setErrors((prev) => {
      if (!prev.documents && !prev[key]) return prev
      const next = { ...prev }
      delete next.documents
      delete next[key]
      return next
    })
  }

  const attachedCount = DOCUMENT_FIELDS.filter(
    ({ key }) => documents[key] !== null,
  ).length

  const validateStep = (index: number): FieldErrors => {
    const next: FieldErrors = {}
    const fields = STEPS[index].fields
    const has = (key: keyof FormState) => fields.includes(key)

    if (has('full_name') && !form.full_name.trim()) {
      next.full_name = 'Full name is required.'
    }
    if (has('phone')) {
      const trimmed = form.phone.trim()
      if (!trimmed) {
        next.phone = 'Phone number is required.'
      } else if (!/^\d{9,12}$/.test(trimmed.replace(/\D/g, ''))) {
        next.phone = 'Enter a valid Ethiopian number, e.g. +251912345678.'
      }
    }
    if (has('gender') && !form.gender) {
      next.gender = 'Select a gender.'
    }
    if (
      has('fayda_fin') &&
      form.fayda_fin.trim() &&
      !/^\d{15}$/.test(form.fayda_fin.trim())
    ) {
      next.fayda_fin = 'Fayda FIN must be a 15-digit number.'
    }
    if (has('region') && !form.region) {
      next.region = 'Select a region.'
    }
    if (has('woreda') && !form.woreda.trim()) {
      next.woreda = 'Woreda is required.'
    }
    if (has('farm_size_hectares')) {
      const size = Number(form.farm_size_hectares)
      if (!form.farm_size_hectares.trim()) {
        next.farm_size_hectares = 'Farm size is required.'
      } else if (!Number.isFinite(size) || size <= 0) {
        next.farm_size_hectares = 'Enter a farm size greater than 0.'
      }
    }
    if (has('primary_crop') && !form.primary_crop.trim()) {
      next.primary_crop = 'Primary crop is required.'
    }
    if (STEPS[index].title === 'Documents' && !documents.farmer_id) {
      next.documents = 'Attach the farmer ID document to continue.'
    }
    return next
  }

  const goNext = () => {
    const found = validateStep(step)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const goBack = () => {
    setErrors({})
    setGeneralError(null)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const goToStep = (index: number) => {
    if (index >= step) return
    setErrors({})
    setGeneralError(null)
    setStep(index)
  }

  const stepForField = (field: string): number => {
    if (['farmer_id', 'field_photo', 'farming_proof', 'documents'].includes(field)) {
      return STEPS.findIndex((item) => item.title === 'Documents')
    }
    const index = STEPS.findIndex((item) =>
      item.fields.includes(field as keyof FormState),
    )
    return index === -1 ? 0 : index
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setGeneralError(null)
    setErrors({})

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

    const uploads = Object.fromEntries(
      DOCUMENT_FIELDS.flatMap(({ key }) => {
        const file = documents[key]
        return file ? [[key, file]] : []
      }),
    )

    try {
      const farmer = await registerFarmer(payload, uploads)
      onSuccess(farmer)
    } catch (err) {
      const normalized = normalizeApiError(err)
      setErrors(normalized.fieldErrors)
      setGeneralError(normalized.general)
      const firstField = Object.keys(normalized.fieldErrors)[0]
      if (firstField) setStep(stepForField(firstField))
    } finally {
      setSubmitting(false)
    }
  }

  const isReview = step === STEPS.length - 1
  const current = STEPS[step]
  const StepIcon = current.icon

  return (
    <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-[0_18px_50px_rgba(22,95,48,0.08)] sm:p-8">
      <ProgressSteps
        steps={STEPS.map((item) => item.title)}
        current={step}
        onSelect={goToStep}
      />

      <div className="mt-8 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint/50 text-forest-deeper">
          <StepIcon className="size-5" />
        </span>
        <div>
          <h2 className="font-serif text-xl font-semibold text-forest-deeper">
            {current.heading}
          </h2>
          <p className="mt-0.5 text-sm text-stone">{current.description}</p>
        </div>
      </div>

      {generalError && (
        <Notice variant="error" className="mt-6">
          {generalError}
        </Notice>
      )}

      <div className="mt-6">
        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="full_name"
              label="Full name"
              required
              error={errors.full_name}
            >
              <TextInput
                value={form.full_name}
                autoComplete="name"
                placeholder="e.g. Abebe Kebede"
                onChange={(event) => update('full_name')(event.target.value)}
              />
            </Field>

            <Field
              id="phone"
              label="Phone number"
              required
              error={errors.phone}
              hint="Any Ethiopian format — normalised to +251…"
            >
              <TextInput
                type="tel"
                autoComplete="tel"
                value={form.phone}
                placeholder="+251912345678"
                leadingIcon={<PhoneIcon className="size-5" />}
                onChange={(event) => update('phone')(event.target.value)}
              />
            </Field>

            <Field id="gender" label="Gender" required error={errors.gender}>
              <Select
                value={form.gender}
                onChange={(event) => update('gender')(event.target.value)}
              >
                <option value="" disabled>
                  Select gender…
                </option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              id="fayda_fin"
              label="Fayda FIN"
              error={errors.fayda_fin}
              hint="Optional — 15-digit national ID."
            >
              <TextInput
                inputMode="numeric"
                maxLength={15}
                value={form.fayda_fin}
                placeholder="15-digit ID number"
                onChange={(event) => update('fayda_fin')(event.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="region" label="Region" required error={errors.region}>
              <Select
                value={form.region}
                onChange={(event) => update('region')(event.target.value)}
              >
                <option value="" disabled>
                  Select region…
                </option>
                {ETHIOPIAN_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </Select>
            </Field>

            <Field id="woreda" label="Woreda" required error={errors.woreda}>
              <TextInput
                value={form.woreda}
                onChange={(event) => update('woreda')(event.target.value)}
              />
            </Field>

            <Field id="kebele" label="Kebele" hint="Optional.">
              <TextInput
                value={form.kebele}
                onChange={(event) => update('kebele')(event.target.value)}
              />
            </Field>

            <Field
              id="farm_size_hectares"
              label="Farm size (hectares)"
              required
              error={errors.farm_size_hectares}
            >
              <TextInput
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.farm_size_hectares}
                placeholder="0.00"
                onChange={(event) =>
                  update('farm_size_hectares')(event.target.value)
                }
              />
            </Field>

            <Field
              id="primary_crop"
              label="Primary crop"
              required
              error={errors.primary_crop}
            >
              <TextInput
                value={form.primary_crop}
                placeholder="e.g. Teff"
                onChange={(event) => update('primary_crop')(event.target.value)}
              />
            </Field>

            <Field id="land_ownership" label="Land ownership" required>
              <Select
                value={form.land_ownership}
                onChange={(event) =>
                  update('land_ownership')(event.target.value)
                }
              >
                {LAND_OWNERSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="sm:col-span-2">
              <Field
                id="land_ownership_notes"
                label="Land ownership notes"
                hint="Optional."
              >
                <Textarea
                  rows={3}
                  value={form.land_ownership_notes}
                  onChange={(event) =>
                    update('land_ownership_notes')(event.target.value)
                  }
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Notice variant="info">
              Attach clear copies now so the verification team can review the
              farmer. Files are encrypted before they are stored, and only
              admins can decrypt them for review. Farmer ID is required.
            </Notice>

            {errors.documents && (
              <p className="text-sm font-medium text-red-600">
                {errors.documents}
              </p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {DOCUMENT_FIELDS.map((doc) => (
                <div key={doc.key}>
                  <Field
                    id={doc.key}
                    label={doc.label}
                    required={doc.key === 'farmer_id'}
                    error={errors[doc.key]}
                  >
                    <FileUpload
                      file={documents[doc.key]}
                      onChange={setDocument(doc.key)}
                      hint={doc.hint}
                    />
                  </Field>
                </div>
              ))}
            </div>

            <p className="text-xs text-stone">
              {attachedCount} of {DOCUMENT_FIELDS.length} attachments added.
            </p>
          </div>
        )}

        {isReview && (
          <div className="space-y-4">
            <ReviewSection title="Farmer details">
              <ReviewItem label="Full name" value={form.full_name || '—'} />
              <ReviewItem label="Phone" value={form.phone || '—'} />
              <ReviewItem
                label="Gender"
                value={
                  GENDER_OPTIONS.find((option) => option.value === form.gender)
                    ?.label ?? '—'
                }
              />
              <ReviewItem
                label="Fayda FIN"
                value={form.fayda_fin || 'Not provided'}
              />
            </ReviewSection>

            <ReviewSection title="Farm information">
              <ReviewItem label="Region" value={form.region || '—'} />
              <ReviewItem label="Woreda" value={form.woreda || '—'} />
              <ReviewItem
                label="Kebele"
                value={form.kebele || 'Not provided'}
              />
              <ReviewItem
                label="Farm size"
                value={
                  form.farm_size_hectares
                    ? `${form.farm_size_hectares} ha`
                    : '—'
                }
              />
              <ReviewItem
                label="Primary crop"
                value={form.primary_crop || '—'}
              />
              <ReviewItem
                label="Land ownership"
                value={
                  LAND_OWNERSHIP_OPTIONS.find(
                    (option) => option.value === form.land_ownership,
                  )?.label ?? '—'
                }
              />
            </ReviewSection>

            <ReviewSection title="Supporting documents">
              {DOCUMENT_FIELDS.map((doc) => (
                <ReviewItem
                  key={doc.key}
                  label={doc.label}
                  value={documents[doc.key]?.name ?? 'Not attached'}
                />
              ))}
            </ReviewSection>

            <p className="text-xs leading-5 text-stone">
              Submitting sends this farmer for verification and creates their
              Azmera account number for USSD. Supporting documents are encrypted
              at rest and decrypted only for admin review.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-forest/10 pt-5">
        <Button variant="secondary" onClick={goBack} disabled={step === 0}>
          Back
        </Button>

        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-medium text-stone sm:block">
            Step {step + 1} of {STEPS.length}
          </span>
          {isReview ? (
            <Button onClick={handleSubmit} loading={submitting}>
              {submitting ? 'Submitting…' : 'Submit for verification'}
            </Button>
          ) : (
            <Button onClick={goNext}>Continue</Button>
          )}
        </div>
      </div>
    </div>
  )
}
