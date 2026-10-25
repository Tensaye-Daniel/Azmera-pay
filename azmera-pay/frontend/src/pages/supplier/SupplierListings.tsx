import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  deleteSupplierListing,
  fetchSupplierListings,
  fetchSupplierProfile,
  fetchSupplierUnits,
  saveSupplierListing,
  supplierApiErrorMessage,
  updateSupplierListingStatus,
  type ListingInput,
  type SupplierListing,
  type SupplierProfile,
  type SupplierUnit,
  type SupplierProductCategory,
  type ListingStatus,
} from '../../api/supplier'
import SupplierStatCard from '../../components/features/supplier/SupplierStatCard'
import SupplierListingStatusBadge from '../../components/features/supplier/SupplierListingStatusBadge'
import {
  AlertIcon,
  CheckCircleIcon,
  ClockIcon,
  StoreIcon,
} from '../../components/ui/icons'

const control =
  'w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-stone-dark outline-none focus-visible:ring-2 focus-visible:ring-forest/30'

const emptyForm = {
  name: '',
  category: '' as SupplierProductCategory | '',
  unit: '',
  available_quantity: '',
  unit_price: '',
  notes: '',
}

const displayStatus = (value: ListingStatus): Exclude<ListingStatus, 'expired'> =>
  value === 'expired' ? 'inactive' : value

export default function SupplierListings() {
  const { t } = useTranslation()

  const getCategoryLabel = (cat: SupplierProductCategory) => {
    switch (cat) {
      case 'crop': return t('agent.crops')
      case 'seed': return t('supplier.seeds')
      case 'fertilizer': return t('supplier.fertilizer')
      case 'pesticide': return t('supplier.chemicals')
      case 'other': return t('supplier.other')
      default: return cat
    }
  }

  const categoryEntries: [SupplierProductCategory, string][] = [
    ['crop', t('agent.crops')],
    ['seed', t('supplier.seeds')],
    ['fertilizer', t('supplier.fertilizer')],
    ['pesticide', t('supplier.chemicals')],
    ['other', t('supplier.other')],
  ]
  const [listings, setListings] = useState<SupplierListing[]>([])
  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [units, setUnits] = useState<SupplierUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadErrors, setLoadErrors] = useState({
    listings: false,
    profile: false,
    units: false,
  })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const refresh = useCallback(async (isCurrent: () => boolean = () => true) => {
    await Promise.resolve()
    if (!isCurrent()) return
    setLoading(true)
    setError('')
    const [itemsResult, shopResult, unitsResult] = await Promise.allSettled([
      fetchSupplierListings(),
      fetchSupplierProfile(),
      fetchSupplierUnits(),
    ])
    if (!isCurrent()) return

    const errors: string[] = []
    setLoadErrors({
      listings: itemsResult.status === 'rejected',
      profile: shopResult.status === 'rejected',
      units: unitsResult.status === 'rejected',
    })

    if (itemsResult.status === 'fulfilled') {
      setListings(itemsResult.value)
    } else {
      errors.push(
        supplierApiErrorMessage(
          itemsResult.reason,
          'Your listings could not be loaded.',
        ),
      )
    }

    if (shopResult.status === 'fulfilled') {
      setProfile(shopResult.value)
    } else {
      errors.push(
        supplierApiErrorMessage(
          shopResult.reason,
          'Your shop setup could not be loaded.',
        ),
      )
    }

    if (unitsResult.status === 'fulfilled') {
      setUnits(unitsResult.value)
    } else {
      errors.push(
        supplierApiErrorMessage(
          unitsResult.reason,
          'Available units could not be loaded.',
        ),
      )
    }

    if (errors.length) setError(errors.join(' '))
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => refresh(() => active))
    return () => {
      active = false
    }
  }, [refresh])

  const visible = useMemo(
    () =>
      listings.filter(
        (item) =>
          item.product_name.toLowerCase().includes(search.trim().toLowerCase()) &&
          (status === 'all' || displayStatus(item.availability_status) === status) &&
          (category === 'all' || item.product_category === category),
      ),
    [listings, search, status, category],
  )

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm,
      category: profile?.product_categories[0] ?? '',
      unit: units[0]?.id ?? '',
    })
    setError('')
    setFormOpen(true)
  }

  function openEdit(item: SupplierListing) {
    setEditing(item.id)
    setForm({
      name: item.product_name,
      category: item.product_category ?? '',
      unit: item.unit,
      available_quantity: item.available_quantity,
      unit_price: item.unit_price,
      notes: item.notes,
    })
    setError('')
    setFormOpen(true)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    if (!form.category) {
      setError('Choose a category in Shop Setup before adding a listing.')
      return
    }

    if (!form.unit || loadErrors.units || units.length === 0) {
      setError('Unit options are unavailable. Reload the page before saving a listing.')
      return
    }

    setSaving(true)
    setError('')

    const current = editing
      ? listings.find((item) => item.id === editing)
      : undefined

    const payload: ListingInput = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      available_quantity: form.available_quantity,
      unit_price: form.unit_price,
      region: profile?.region ?? '',
      woreda: profile?.woreda ?? '',
      availability_status: current?.availability_status ?? 'active',
      notes: form.notes,
    }

    try {
      await saveSupplierListing(payload, editing ?? undefined)
      setFormOpen(false)
      setEditing(null)
    } catch (saveError) {
      setError(
        supplierApiErrorMessage(
          saveError,
          'The listing could not be saved. Check the details and your Shop Setup categories, then try again.',
        ),
      )
      setSaving(false)
      return
    }

    setSaving(false)

    try {
      await refresh()
    } catch {
      // Refresh error is handled internally; do not report as a save failure
    }
  }

  async function remove(item: SupplierListing) {
    if (!window.confirm(`Delete “${item.product_name}”? This cannot be undone.`))
      return
    setError('')
    try {
      await deleteSupplierListing(item.id)
      setListings((current) => current.filter((entry) => entry.id !== item.id))
    } catch (err: unknown) {
      setError(
        supplierApiErrorMessage(
          err,
          'The listing could not be deleted. Please try again.',
        ),
      )
    }
  }

  async function changeStatus(
    item: SupplierListing,
    nextStatus: 'active' | 'paused' | 'inactive',
  ) {
    setError('')
    try {
      const updated = await updateSupplierListingStatus(item.id, nextStatus)
      setListings((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      )
    } catch (err: unknown) {
      setError(
        supplierApiErrorMessage(
          err,
          `Could not update “${item.product_name}”. Please try again.`,
        ),
      )
    }
  }

  const activeCount = listings.filter(
    (item) => item.availability_status === 'active',
  ).length
  const pausedCount = listings.filter(
    (item) => item.availability_status === 'paused',
  ).length
  const inactiveCount = listings.filter(
    (item) =>
      item.availability_status === 'inactive' ||
      item.availability_status === 'expired',
  ).length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-forest uppercase">{t('supplier.workspaceTitle')}</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-forest-deeper">
            {t('supplier.listingsTitle')}
          </h1>
          <p className="mt-2 text-sm text-stone">
            {t('supplier.listingsSubtitle')}
          </p>
        </div>
        <button
          onClick={
            formOpen
              ? () => {
                  setFormOpen(false)
                  setEditing(null)
                }
              : openCreate
          }
          className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-deeper"
        >
          {formOpen ? t('supplier.closeForm') : `+ ${t('supplier.addListing')}`}
        </button>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {formOpen && (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 sm:p-6"
        >
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest-deeper">
              {editing ? t('supplier.editListingTitle') : t('supplier.addListingTitle')}
            </h2>
            <p className="mt-1 text-sm text-stone">
              {t('supplier.productNameCatalogDesc')}
            </p>
          </div>

          {loadErrors.profile ? (
            <div
              role="alert"
              className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
            >
              Shop setup could not be checked. Reload the page before creating a
              listing.
            </div>
          ) : !profile?.product_categories.length ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              Set up at least one product category before creating listings.{' '}
              <Link className="font-semibold underline" to="/supplier/shop-setup">
                {t('supplier.manageShopSetup')}
              </Link>
            </div>
          ) : loadErrors.units || units.length === 0 ? (
            <div
              role="alert"
              className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
            >
              Unit options could not be loaded. Reload the page before creating or
              editing a listing.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-forest-deeper">
                  {t('supplier.productName')}
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. NPSB 19-38-7 Fertilizer"
                    className={`${control} mt-1`}
                  />
                </label>

                <label className="text-sm font-medium text-forest-deeper">
                  {t('supplier.category')}
                  <select
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as SupplierProductCategory,
                      })
                    }
                    className={`${control} mt-1`}
                  >
                    <option value="">{t('supplier.chooseCategory')}</option>
                    {profile.product_categories.map((item) => (
                      <option key={item} value={item}>
                        {getCategoryLabel(item)}
                      </option>
                    ))}
                    {editing &&
                      form.category &&
                      !profile.product_categories.includes(form.category) && (
                        <option value={form.category}>
                          {getCategoryLabel(form.category)} (previously configured)
                        </option>
                      )}
                  </select>
                </label>

                <label className="text-sm font-medium text-forest-deeper">
                  {t('supplier.availableQuantity')}
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.available_quantity}
                    onChange={(e) =>
                      setForm({ ...form, available_quantity: e.target.value })
                    }
                    className={`${control} mt-1`}
                  />
                </label>

                <label className="text-sm font-medium text-forest-deeper">
                  {t('supplier.unit')}
                  <select
                    required
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className={`${control} mt-1`}
                  >
                    <option value="">{t('supplier.chooseUnit')}</option>
                    {units.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.code})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-forest-deeper">
                  {t('supplier.pricePerUnit')}
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.unit_price}
                    onChange={(e) =>
                      setForm({ ...form, unit_price: e.target.value })
                    }
                    className={`${control} mt-1`}
                  />
                </label>

                <label className="text-sm font-medium text-forest-deeper">
                  {t('supplier.notes')} <span className="font-normal text-stone">({t('supplier.optional')})</span>
                  <input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={`${control} mt-1`}
                  />
                </label>
              </div>

              <p className="text-xs text-stone">
                Listing location uses your saved Shop Setup location:{' '}
                {profile.region}, {profile.woreda}.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false)
                    setEditing(null)
                  }}
                  className="rounded-xl border border-forest/20 px-4 py-2.5 text-sm font-semibold text-forest"
                >
                  {t('common.cancel')}
                </button>
                <button
                  disabled={saving}
                  className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving
                    ? t('common.saving')
                    : editing
                      ? t('supplier.saveChanges')
                      : t('supplier.addListing')}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      <section
        aria-label="Listing statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SupplierStatCard
          title={t('supplier.totalListings')}
          value={loading ? '…' : listings.length}
          description={t('supplier.totalListingsDesc')}
          tone="total"
          icon={StoreIcon}
        />
        <SupplierStatCard
          title={t('supplier.activeListings')}
          value={loading ? '…' : activeCount}
          description={t('supplier.activeListingsDesc')}
          tone="active"
          icon={CheckCircleIcon}
        />
        <SupplierStatCard
          title={t('supplier.pausedListings')}
          value={loading ? '…' : pausedCount}
          description={t('supplier.pausedListingsDesc')}
          tone="paused"
          icon={ClockIcon}
        />
        <SupplierStatCard
          title={t('supplier.inactiveListings')}
          value={loading ? '…' : inactiveCount}
          description={t('supplier.inactiveListingsDesc')}
          tone="inactive"
          icon={AlertIcon}
        />
      </section>

      <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <label>
            <span className="sr-only">{t('common.search')}</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className={control}
            />
          </label>
          <label>
            <span className="sr-only">{t('common.filter')}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={control}
            >
              <option value="all">{t('common.all')}</option>
              {categoryEntries.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('common.status')}</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={control}
            >
              <option value="all">{t('common.all')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="paused">{t('common.paused')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p role="status" className="py-12 text-center text-sm text-stone">
            {t('common.loading')}
          </p>
        ) : loadErrors.listings ? (
          <p role="alert" className="py-12 text-center text-sm text-red-800">
            {t('common.error')}
          </p>
        ) : listings.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="font-semibold text-forest-deeper">{t('supplier.noListingsYet')}</h2>
            <p className="mt-1 text-sm text-stone">
              {t('supplier.shopReadyDesc')}
            </p>
            <button
              onClick={openCreate}
              className="mt-4 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white"
            >
              {t('supplier.addListing')}
            </button>
          </div>
        ) : visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone">
            No listings match those filters.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-xl border border-forest/10">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[#f7faf6] text-xs uppercase tracking-wide text-stone">
                <tr>
                  {[
                    t('supplier.productName'),
                    t('supplier.category'),
                    t('supplier.availableQuantity'),
                    t('supplier.pricePerUnit'),
                    t('common.status'),
                    t('common.actions'),
                  ].map((head) => (
                    <th key={head} className="px-4 py-3">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-forest-deeper">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-stone">
                        Updated {new Date(item.updated_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {item.product_category
                        ? getCategoryLabel(item.product_category)
                        : '—'}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {item.available_quantity} {item.unit_code}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      ETB{' '}
                      {Number(item.unit_price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <SupplierListingStatusBadge
                        status={item.availability_status}
                      />
                      <label className="mt-2 block">
                        <span className="sr-only">
                          Change status for {item.product_name}
                        </span>
                        <select
                          aria-label={`Change status for ${item.product_name}`}
                          value={
                            item.availability_status === 'expired'
                              ? 'inactive'
                              : item.availability_status
                          }
                          onChange={(e) =>
                            void changeStatus(
                              item,
                              e.target.value as 'active' | 'paused' | 'inactive',
                            )
                          }
                          className={`${control} max-w-36 py-1.5 text-xs`}
                        >
                          <option value="active">{t('common.active')}</option>
                          <option value="paused">{t('common.paused')}</option>
                          <option value="inactive">{t('common.inactive')}</option>
                        </select>
                      </label>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-3 text-sm font-semibold">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-forest underline"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => void remove(item)}
                          className="text-red-700 underline"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-stone">
          Showing {visible.length} of {listings.length} listings
        </p>
      </section>
    </div>
  )
}
