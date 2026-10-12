import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AxiosError } from 'axios'
import { submitAgentRegistration } from '../../../api/agentRegistration'
import { ETHIOPIAN_REGIONS, GENDER_OPTIONS, ID_TYPE_OPTIONS } from '../../../data/reference'
import {
  EMPTY_AGENT_FORM,
  type AgentRegistrationFormData,
  type AgentRegistrationResult,
} from '../../../types/agentRegistration'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import FileUpload from '../../ui/FileUpload'
import LegalDialog from '../../ui/LegalDialog'
import Notice from '../../ui/Notice'
import PasswordInput from '../../ui/PasswordInput'
import ProgressSteps from '../../ui/ProgressSteps'
import Select from '../../ui/Select'
import TextInput from '../../ui/TextInput'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  HashIcon,
  LocateIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  UserPlusIcon,
} from '../../ui/icons'

interface AgentSignupWizardProps {
  onSuccess: (result: AgentRegistrationResult) => void
}

type FieldErrors = Partial<Record<keyof AgentRegistrationFormData, string>>

const STEP_TITLES = ['Personal', 'Identity', 'Agent details', 'Security & review']

const STEP_SUMMARIES = [
  'Tell us who you are and where you are based.',
  'Verify your identity with a government document.',
  'Confirm your operating area and organisation.',
  'Secure your account and review your details.',
]

const PHONE_PATTERN = /^(?:\+251|0)?[79]\d{8}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const API_FIELD_MAP: Record<string, keyof AgentRegistrationFormData> = {
  full_name: 'fullName',
  phone: 'phone',
  email: 'email',
  password: 'password',
}

function ageFrom(dateString: string): number | null {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const monthDelta = now.getMonth() - date.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < date.getDate())) {
    age -= 1
  }
  return age
}

function passwordScore(password: string): number {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[a-z]/i.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']

function validateStep(
  index: number,
  form: AgentRegistrationFormData,
): FieldErrors {
  const errors: FieldErrors = {}

  if (index === 0) {
    if (!form.fullName.trim()) errors.fullName = 'Full name is required.'
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required.'
    } else if (!PHONE_PATTERN.test(form.phone.trim().replace(/\s+/g, ''))) {
      errors.phone = 'Enter a valid Ethiopian number, e.g. +251912345678.'
    }
    if (!form.email.trim()) {
      errors.email = 'Email address is required.'
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }
    if (!form.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.'
    } else {
      const age = ageFrom(form.dateOfBirth)
      if (age === null) errors.dateOfBirth = 'Enter a valid date of birth.'
      else if (age < 18) errors.dateOfBirth = 'You must be at least 18 years old.'
      else if (age > 100) errors.dateOfBirth = 'Enter a valid date of birth.'
    }
    if (!form.gender) errors.gender = 'Select a gender.'
    if (!form.region) errors.region = 'Select your region.'
    if (!form.localArea.trim()) errors.localArea = 'Local area is required.'
  }

  if (index === 1) {
    if (!form.idType) errors.idType = 'Select an ID type.'
    if (!form.idNumber.trim()) {
      errors.idNumber = 'Government ID number is required.'
    } else if (form.idNumber.trim().length < 4) {
      errors.idNumber = 'Enter a valid ID number.'
    }
    if (!form.idDocument) errors.idDocument = 'Upload your government ID document.'
  }

  if (index === 2) {
    if (!form.operatingRegion) {
      errors.operatingRegion = 'Select your operating region.'
    }
  }

  if (index === 3) {
    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    } else if (!/[a-z]/i.test(form.password) || !/\d/.test(form.password)) {
      errors.password = 'Include at least one letter and one number.'
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.'
    } else if (form.confirmPassword !== form.password) {
      errors.confirmPassword = 'Passwords do not match.'
    }
    if (!form.acceptedTerms) {
      errors.acceptedTerms = 'You must accept the Terms and Conditions.'
    }
  }

  return errors
}

function normalizeApiError(error: unknown): {
  fieldErrors: FieldErrors
  general: string | null
} {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data
    if (typeof data === 'object' && data !== null) {
      if ('detail' in data && typeof data.detail === 'string') {
        return { fieldErrors: {}, general: data.detail }
      }
      const fieldErrors: FieldErrors = {}
      for (const [field, message] of Object.entries(data)) {
        const key = API_FIELD_MAP[field]
        if (!key) continue
        fieldErrors[key] = Array.isArray(message)
          ? message.map(String).join(' ')
          : String(message)
      }
      if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors, general: null }
      }
    }
  }
  return {
    fieldErrors: {},
    general: 'Could not create your account. Please try again.',
  }
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-stone-dark">
        {value}
      </dd>
    </div>
  )
}

export default function AgentSignupWizard({ onSuccess }: AgentSignupWizardProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<AgentRegistrationFormData>(EMPTY_AGENT_FORM)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  const update = <K extends keyof AgentRegistrationFormData>(
    key: K,
    value: AgentRegistrationFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const goNext = () => {
    const stepErrors = validateStep(step, form)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) return
    setStep((prev) => Math.min(prev + 1, STEP_TITLES.length - 1))
  }

  const goBack = () => {
    setErrors({})
    setGeneralError(null)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleStepSelect = (index: number) => {
    setErrors({})
    setGeneralError(null)
    setStep(index)
  }

  const handleSubmit = async () => {
    if (submitting) return

    for (let index = 0; index < STEP_TITLES.length; index += 1) {
      const stepErrors = validateStep(index, form)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        setStep(index)
        return
      }
    }

    setSubmitting(true)
    setGeneralError(null)
    setErrors({})

    try {
      const result = await submitAgentRegistration(form)
      onSuccess(result)
    } catch (error) {
      const { fieldErrors, general } = normalizeApiError(error)
      setErrors(fieldErrors)
      setGeneralError(general)
      const firstError = Object.keys(fieldErrors)[0]
      if (firstError === 'password') setStep(3)
    } finally {
      setSubmitting(false)
    }
  }

  const isLastStep = step === STEP_TITLES.length - 1
  const strength = passwordScore(form.password)

  return (
    <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-[0_18px_50px_rgba(22,95,48,0.10)] sm:p-8">
      <header className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-forest-deeper">
          Create Your Agent Account
        </h2>
        <p className="mt-1 text-sm text-stone">
          Join the Azmera team and start making an impact.
        </p>
      </header>

      <ProgressSteps
        steps={STEP_TITLES}
        current={step}
        onSelect={handleStepSelect}
      />

      <div className="mb-6 mt-6">
        <h3 className="font-serif text-lg font-semibold text-forest-deeper">
          Step {step + 1} of {STEP_TITLES.length} · {STEP_TITLES[step]}
        </h3>
        <p className="mt-1 text-sm text-stone">{STEP_SUMMARIES[step]}</p>
      </div>

      {generalError && (
        <Notice variant="error" className="mb-6">
          {generalError}
        </Notice>
      )}

      {step === 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="fullName"
            label="Full name"
            required
            error={errors.fullName}
          >
            <TextInput
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => update('fullName', event.target.value)}
              leadingIcon={<UserPlusIcon className="size-5" />}
              placeholder="Abebe Bekele"
            />
          </Field>

          <Field
            id="phone"
            label="Phone number"
            required
            error={errors.phone}
            hint="Ethiopian number with +251 country code."
          >
            <TextInput
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              leadingIcon={<PhoneIcon className="size-5" />}
              placeholder="+251912345678"
            />
          </Field>

          <Field
            id="email"
            label="Email address"
            required
            error={errors.email}
            className="sm:col-span-2"
          >
            <TextInput
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              leadingIcon={<MailIcon className="size-5" />}
              placeholder="you@example.com"
            />
          </Field>

          <Field
            id="dateOfBirth"
            label="Date of birth"
            required
            error={errors.dateOfBirth}
          >
            <TextInput
              type="date"
              autoComplete="bday"
              value={form.dateOfBirth}
              onChange={(event) => update('dateOfBirth', event.target.value)}
              leadingIcon={<CalendarIcon className="size-5" />}
            />
          </Field>

          <Field id="gender" label="Gender" required error={errors.gender}>
            <Select
              value={form.gender}
              onChange={(event) =>
                update(
                  'gender',
                  event.target.value as AgentRegistrationFormData['gender'],
                )
              }
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

          <Field id="region" label="Region" required error={errors.region}>
            <Select
              value={form.region}
              onChange={(event) => {
                const region = event.target.value
                setForm((prev) => ({
                  ...prev,
                  region,
                  operatingRegion: prev.operatingRegion || region,
                }))
                setErrors((prev) => {
                  if (!prev.region) return prev
                  const next = { ...prev }
                  delete next.region
                  return next
                })
              }}
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

          <Field
            id="localArea"
            label="Local area"
            required
            error={errors.localArea}
            hint="City, woreda or kebele."
          >
            <TextInput
              value={form.localArea}
              onChange={(event) => update('localArea', event.target.value)}
              leadingIcon={<LocateIcon className="size-5" />}
              placeholder="e.g. Bishoftu, Adea"
            />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Notice variant="info" className="sm:col-span-2">
            <p className="font-semibold text-stone-dark">
              Your identity document is private.
            </p>
            <p className="mt-1">
              Identity documents are only accessible to authorized Azmera
              reviewers and are never publicly accessible. Secure server-side
              document upload is not enabled in this environment yet, so the
              file stays in your browser and is not transmitted; a reviewer will
              collect verification documents after your account is created.
            </p>
          </Notice>

          <Field
            id="idType"
            label="Government ID type"
            required
            error={errors.idType}
          >
            <Select
              value={form.idType}
              onChange={(event) =>
                update(
                  'idType',
                  event.target.value as AgentRegistrationFormData['idType'],
                )
              }
            >
              <option value="" disabled>
                Select ID type…
              </option>
              {ID_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id="idNumber"
            label="Government ID number"
            required
            error={errors.idNumber}
          >
            <TextInput
              value={form.idNumber}
              onChange={(event) => update('idNumber', event.target.value)}
              leadingIcon={<HashIcon className="size-5" />}
              placeholder="ID number"
            />
          </Field>

          <Field
            id="idDocument"
            label="Government ID document"
            required
            error={errors.idDocument}
            className="sm:col-span-2"
          >
            <FileUpload
              file={form.idDocument}
              onChange={(file) => update('idDocument', file)}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="operatingRegion"
            label="Assigned region / operating area"
            required
            error={errors.operatingRegion}
            className="sm:col-span-2"
          >
            <Select
              value={form.operatingRegion}
              onChange={(event) =>
                update('operatingRegion', event.target.value)
              }
            >
              <option value="" disabled>
                Select operating region…
              </option>
              {ETHIOPIAN_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            id="agentNumber"
            label="Agent ID number"
            error={errors.agentNumber}
            hint="Only if Azmera or an administrator has given you one. Do not create your own."
          >
            <TextInput
              value={form.agentNumber}
              onChange={(event) => update('agentNumber', event.target.value)}
              leadingIcon={<HashIcon className="size-5" />}
              placeholder="Provided by Azmera admin"
            />
          </Field>

          <Field
            id="organization"
            label="Employment / organisation (optional)"
            error={errors.organization}
          >
            <TextInput
              value={form.organization}
              onChange={(event) => update('organization', event.target.value)}
              leadingIcon={<BriefcaseIcon className="size-5" />}
              placeholder="e.g. Cooperative or union"
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="password"
              label="Password"
              required
              error={errors.password}
            >
              <PasswordInput
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                leadingIcon={<LockIcon className="size-5" />}
              />
            </Field>

            <Field
              id="confirmPassword"
              label="Confirm password"
              required
              error={errors.confirmPassword}
            >
              <PasswordInput
                value={form.confirmPassword}
                onChange={(event) =>
                  update('confirmPassword', event.target.value)
                }
                leadingIcon={<LockIcon className="size-5" />}
              />
            </Field>
          </div>

          {form.password && (
            <div>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={`h-1.5 flex-1 rounded-full ${
                      bar < strength ? 'bg-forest' : 'bg-forest/15'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs leading-5 text-stone">
                Password strength: {STRENGTH_LABELS[strength]} · use 8+ characters
                with letters and numbers.
              </p>
            </div>
          )}

          <div>
            <label className="flex items-start gap-3 rounded-xl border border-forest/15 bg-mint/15 p-4">
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={(event) =>
                  update('acceptedTerms', event.target.checked)
                }
                className="mt-0.5 size-4 shrink-0 rounded accent-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
              />
              <span className="text-xs leading-5 text-stone">
                I agree to Azmera's{' '}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="font-semibold text-forest underline-offset-2 hover:underline"
                >
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setPrivacyOpen(true)}
                  className="font-semibold text-forest underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>
            {errors.acceptedTerms && (
              <p
                role="alert"
                className="mt-1.5 text-xs leading-5 text-red-600"
              >
                {errors.acceptedTerms}
              </p>
            )}
          </div>

          <section className="rounded-xl border border-forest/10 bg-white p-4">
            <h4 className="mb-1 flex items-center gap-2 font-serif text-base font-semibold text-forest-deeper">
              <ShieldIcon className="size-4" />
              Review your information
            </h4>
            <p className="mb-3 text-xs leading-5 text-stone">
              Your account will be created with your name, phone, email and
              password. Identity and agent details are collected for reviewer
              verification and are shown here for your confirmation.
            </p>

            <dl className="grid grid-cols-1 divide-y divide-forest/5 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
              <ReviewRow label="Full name" value={form.fullName || '—'} />
              <ReviewRow label="Phone" value={form.phone || '—'} />
              <ReviewRow label="Email" value={form.email || '—'} />
              <ReviewRow label="Date of birth" value={form.dateOfBirth || '—'} />
              <ReviewRow
                label="Gender"
                value={
                  GENDER_OPTIONS.find((option) => option.value === form.gender)
                    ?.label ?? '—'
                }
              />
              <ReviewRow label="Region" value={form.region || '—'} />
              <ReviewRow label="Local area" value={form.localArea || '—'} />
              <ReviewRow
                label="ID type"
                value={
                  ID_TYPE_OPTIONS.find((option) => option.value === form.idType)
                    ?.label ?? '—'
                }
              />
              <ReviewRow label="ID number" value={form.idNumber || '—'} />
              <ReviewRow
                label="ID document"
                value={form.idDocument?.name ?? 'Not attached'}
              />
              <ReviewRow
                label="Operating region"
                value={form.operatingRegion || '—'}
              />
              <ReviewRow
                label="Agent ID number"
                value={form.agentNumber || 'Not provided'}
              />
              <ReviewRow
                label="Employment / organisation"
                value={form.organization || 'Not provided'}
              />
            </dl>
          </section>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={goBack}
          disabled={step === 0 || submitting}
          icon={<ArrowLeftIcon className="size-4" />}
        >
          Back
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            icon={submitting ? undefined : <CheckIcon className="size-4" />}
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </Button>
        ) : (
          <Button onClick={goNext} icon={<ArrowRightIcon className="size-4" />}>
            Continue
          </Button>
        )}
      </div>

      {!isLastStep && (
        <p className="mt-4 text-center text-sm text-stone">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-forest underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      )}

      <LegalDialog
        open={termsOpen}
        title="Terms and Conditions"
        onClose={() => setTermsOpen(false)}
      >
        <p>
          By creating an Azmera agent account you agree to register farmers
          accurately and only with their consent, to protect the personal data
          you collect, and to use the platform in line with Azmera's policies.
        </p>
        <p>
          Full terms are provided by Azmera and may be updated. Continued use of
          your account means you accept the current terms.
        </p>
      </LegalDialog>

      <LegalDialog
        open={privacyOpen}
        title="Privacy Policy"
        onClose={() => setPrivacyOpen(false)}
      >
        <p>
          Azmera collects the information you submit to create and verify your
          agent account. Identity documents are restricted to authorized
          reviewers and are never made publicly accessible.
        </p>
        <p>
          Contact Azmera to access, correct or delete your personal data, or
          with any privacy questions.
        </p>
      </LegalDialog>
    </div>
  )
}
