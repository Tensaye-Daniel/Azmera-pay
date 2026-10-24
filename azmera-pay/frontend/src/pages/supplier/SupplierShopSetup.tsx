import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchSupplierProfile,
  supplierApiErrorMessage,
  updateSupplierProfile,
  type SupplierProductCategory,
  type SupplierProfile,
} from '../../api/supplier'

const categories: {
  value: SupplierProductCategory
  label: string
}[] = [
  { value: 'crop', label: 'Crops' },
  { value: 'seed', label: 'Seeds' },
  { value: 'fertilizer', label: 'Fertilizers' },
  { value: 'pesticide', label: 'Pesticides' },
  { value: 'other', label: 'Other agricultural products' },
]

export default function SupplierShopSetup() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<SupplierProfile>({
    company_name: '',
    region: '',
    woreda: '',
    product_categories: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const data = await fetchSupplierProfile()

        if (active) {
          setProfile(data)
        }
      } catch (reason: unknown) {
        if (active) {
          setError(
            supplierApiErrorMessage(
              reason,
              'Could not load your shop details. Please try again.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [])

  function toggleCategory(category: SupplierProductCategory) {
    setProfile((current) => {
      const selected = current.product_categories.includes(category)

      return {
        ...current,
        product_categories: selected
          ? current.product_categories.filter((item) => item !== category)
          : [...current.product_categories, category],
      }
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!profile.region.trim() || !profile.woreda.trim()) {
      setError('Enter your region and woreda to complete shop setup.')
      return
    }
    if (profile.product_categories.length === 0) {
      setError('Select at least one product category to complete shop setup.')
      return
    }
    setSaving(true)

    try {
      const updated = await updateSupplierProfile({
        region: profile.region.trim(),
        woreda: profile.woreda.trim(),
        product_categories: profile.product_categories,
      })

      setProfile(updated)
      setSuccess('Your shop details have been saved successfully.')
      navigate('/supplier', { replace: true })
    } catch (err: unknown) {
      setError(
        supplierApiErrorMessage(
          err,
          'Could not save your shop details. Please check your information and try again.',
        ),
      )
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading your shop details...
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-sm font-medium text-green-700">Supplier account</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Shop Setup</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Manage your shop location and the agricultural products your business
          supplies.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
      >
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        <div>
          <label
            htmlFor="company_name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Shop or company name
          </label>
          <input
            id="company_name"
            type="text"
            value={profile.company_name}
            readOnly
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your registered company name cannot be changed here.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="region"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Region
            </label>
            <input
              id="region"
              type="text"
              value={profile.region}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  region: event.target.value,
                })
              }
              required
              maxLength={100}
              placeholder="Enter your region"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="woreda"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Woreda
            </label>
            <input
              id="woreda"
              type="text"
              value={profile.woreda}
              onChange={(event) =>
                setProfile({
                  ...profile,
                  woreda: event.target.value,
                })
              }
              required
              maxLength={100}
              placeholder="Enter your woreda"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">
            Products you supply
          </legend>
          <p className="mt-1 text-sm text-gray-600">
            Select all categories that apply to your business.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <label
                key={category.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={profile.product_categories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                  className="h-4 w-4 accent-green-700"
                />
                <span className="text-sm text-gray-800">{category.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save shop details'}
          </button>
        </div>
      </form>
    </section>
  )
}
