import { useState, type FormEvent } from 'react'
import { registerFarmer, updateFarmer } from '../../../api/farmers'
import {
  ETHIOPIAN_REGIONS,
  LAND_OWNERSHIP_OPTIONS,
} from '../../../data/reference'
import type { Farmer, FarmerRegistrationInput } from '../../../types/farmer'
import { normalizeApiError } from '../../../utils/apiError'
import Button from '../../ui/Button'
import Field from '../../ui/Field'
import Notice from '../../ui/Notice'
import Select from '../../ui/Select'
import TextInput from '../../ui/TextInput'
import Textarea from '../../ui/Textarea'
import { PhoneIcon } from '../../ui/icons'

interface FarmerFormProps {
  mode: 'create' | 'edit'
  initial?: Farmer
  onSuccess: (farmer: Farmer) => void
  onCancel?: () => void
}

type FieldErrors = Record<string, string>

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

export default function FarmerForm({
  mode,
  initial,
  onSuccess,
  onCancel,
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
  const [errors, setErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
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
    setErrors({})

    const payload: FarmerRegistrationInput = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      fayda_fin: form.fayda_fin.trim() || undefined,
      region: form.region,
      woreda: form.woreda.trim(),
      kebele: form.kebele.trim() || undefined,
      farm_size_hectares: form.farm_size_hectares.trim(),
      primary_crop: form.primary_crop.trim(),
      land_ownership: form.land_ownership,
      land_ownership_notes: form.land_ownership_notes.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }

    try {
      const saved =
        mode === 'edit' && initial
          ? await updateFarmer(initial.id, payload)
          : await registerFarmer(payload)
      onSuccess(saved)
    } catch (err) {
      const normalized = normalizeApiError(err)
      setErrors(normalized.fieldErrors)
      setGeneralError(normalized.general)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-forest/10 bg-white p-6 shadow-[0_18px_50px_rgba(22,95,48,0.08)] sm:p-8"
    >
      {generalError && (
        <Notice variant="error" className="mb-6">
          {generalError}
        </Notice>
      )}

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
            onChange={(event) => update('fayda_fin')(event.target.value)}
          />
        </Field>

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
            onChange={(event) => update('land_ownership')(event.target.value)}
          >
            {LAND_OWNERSHIP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="land_ownership_notes"
          label="Land ownership notes"
          hint="Optional."
        >
          <TextInput
            value={form.land_ownership_notes}
            onChange={(event) =>
              update('land_ownership_notes')(event.target.value)
            }
          />
        </Field>

        <div className="sm:col-span-2">
          <Field id="notes" label="Notes" hint="Optional.">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(event) => update('notes')(event.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-forest/10 pt-5">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {mode === 'edit' ? 'Save changes' : 'Register farmer'}
        </Button>
      </div>
    </form>
  )
}
