import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { deleteSupplierListing, fetchSupplierListings, fetchSupplierProfile, fetchSupplierUnits, saveSupplierListing, updateSupplierListingStatus, type ListingInput, type SupplierListing, type SupplierProfile, type SupplierUnit, type SupplierProductCategory, type ListingStatus } from '../../api/supplier'
import SupplierStatCard from '../../components/features/supplier/SupplierStatCard'
import SupplierListingStatusBadge from '../../components/features/supplier/SupplierListingStatusBadge'
import { AlertIcon, CheckCircleIcon, ClockIcon, StoreIcon } from '../../components/ui/icons'

const categoryLabels: Record<SupplierProductCategory, string> = {
  crop: 'Crops', seed: 'Seeds', fertilizer: 'Fertilizers', pesticide: 'Pesticides', other: 'Other agricultural products',
}
const control = 'w-full rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-sm text-stone-dark outline-none focus-visible:ring-2 focus-visible:ring-forest/30'
const emptyForm = { name: '', category: '' as SupplierProductCategory | '', unit: '', available_quantity: '', unit_price: '', notes: '' }
const statusLabel: Record<ListingStatus, string> = { active: 'Active', paused: 'Paused', inactive: 'Inactive', expired: 'Inactive' }
const displayStatus = (value: ListingStatus): Exclude<ListingStatus, 'expired'> => value === 'expired' ? 'inactive' : value

export default function SupplierListings() {
  const [listings, setListings] = useState<SupplierListing[]>([])
  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [units, setUnits] = useState<SupplierUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [items, shop, availableUnits] = await Promise.all([fetchSupplierListings(), fetchSupplierProfile(), fetchSupplierUnits()])
      setListings(items)
      setProfile(shop)
      setUnits(availableUnits)
    } catch {
      setError('We could not load your listings. Check your connection and try again.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    let active = true
    void Promise.all([fetchSupplierListings(), fetchSupplierProfile(), fetchSupplierUnits()]).then(([items, shop, availableUnits]) => {
      if (!active) return
      setListings(items); setProfile(shop); setUnits(availableUnits)
    }).catch(() => { if (active) setError('We could not load your listings. Check your connection and try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const visible = useMemo(() => listings.filter((item) =>
    item.product_name.toLowerCase().includes(search.trim().toLowerCase()) &&
    (status === 'all' || displayStatus(item.availability_status) === status) &&
    (category === 'all' || item.product_category === category)), [listings, search, status, category])

  function openCreate() {
    setEditing(null); setForm({ ...emptyForm, category: profile?.product_categories[0] ?? '', unit: units[0]?.id ?? '' }); setError(''); setFormOpen(true)
  }
  function openEdit(item: SupplierListing) {
    setEditing(item.id); setForm({ name: item.product_name, category: item.product_category ?? '', unit: item.unit, available_quantity: item.available_quantity, unit_price: item.unit_price, notes: item.notes }); setError(''); setFormOpen(true)
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return
    if (!form.category) { setError('Choose a category in Shop Setup before adding a listing.'); return }
    setSaving(true); setError('')
    const current = editing ? listings.find((item) => item.id === editing) : undefined
    const payload: ListingInput = {
      name: form.name.trim(), category: form.category,
      unit: form.unit, available_quantity: form.available_quantity, unit_price: form.unit_price,
      region: profile?.region ?? '', woreda: profile?.woreda ?? '', availability_status: current?.availability_status ?? 'active', notes: form.notes,
    }
    try { await saveSupplierListing(payload, editing ?? undefined); setFormOpen(false); setEditing(null); await refresh() }
    catch { setError('The listing could not be saved. Check the details and your Shop Setup categories, then try again.') }
    finally { setSaving(false) }
  }
  async function remove(item: SupplierListing) {
    if (!window.confirm(`Delete “${item.product_name}”? This cannot be undone.`)) return
    setError('')
    try { await deleteSupplierListing(item.id); setListings((current) => current.filter((entry) => entry.id !== item.id)) }
    catch { setError('The listing could not be deleted. Please try again.') }
  }

  async function changeStatus(item: SupplierListing, nextStatus: 'active' | 'paused' | 'inactive') {
    setError('')
    try {
      const updated = await updateSupplierListingStatus(item.id, nextStatus)
      setListings((current) => current.map((entry) => entry.id === updated.id ? updated : entry))
    } catch {
      setError(`Could not change “${item.product_name}” to ${statusLabel[nextStatus].toLowerCase()}. Please try again.`)
    }
  }

  const activeCount = listings.filter((item) => item.availability_status === 'active').length
  const pausedCount = listings.filter((item) => item.availability_status === 'paused').length
  const inactiveCount = listings.filter((item) => item.availability_status === 'inactive' || item.availability_status === 'expired').length
  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-medium text-forest">Supplier workspace</p><h1 className="mt-1 font-serif text-3xl font-semibold text-forest-deeper">My Listings</h1><p className="mt-2 text-sm text-stone">Manage the products, prices, and quantities your shop offers.</p></div>
      <button onClick={formOpen ? () => { setFormOpen(false); setEditing(null) } : openCreate} className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-deeper">{formOpen ? 'Close form' : '+ Add listing'}</button>
    </header>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {formOpen && <form onSubmit={submit} className="space-y-4 rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
      <div><h2 className="font-serif text-xl font-semibold text-forest-deeper">{editing ? 'Edit listing' : 'Add a listing'}</h2><p className="mt-1 text-sm text-stone">Product name is stored in the product catalog. Choose a category enabled in your Shop Setup.</p></div>
      {!profile?.product_categories.length ? <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Set up at least one product category before creating listings. <Link className="font-semibold underline" to="/supplier/shop-setup">Go to Shop Setup</Link></div> : <>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-forest-deeper">Product name<input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. NPSB 19-38-7 Fertilizer" className={`${control} mt-1`} /></label>
          <label className="text-sm font-medium text-forest-deeper">Product category<select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SupplierProductCategory })} className={`${control} mt-1`}><option value="">Choose category</option>{profile.product_categories.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}{editing && form.category && !profile.product_categories.includes(form.category) && <option value={form.category}>{categoryLabels[form.category]} (previously configured)</option>}</select></label>
          <label className="text-sm font-medium text-forest-deeper">Available quantity<input required type="number" min="0.01" step="0.01" value={form.available_quantity} onChange={(e) => setForm({ ...form, available_quantity: e.target.value })} className={`${control} mt-1`} /></label>
          <label className="text-sm font-medium text-forest-deeper">Unit<select required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={`${control} mt-1`}><option value="">Choose unit</option>{units.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>
          <label className="text-sm font-medium text-forest-deeper">Price per unit (ETB)<input required type="number" min="0.01" step="0.01" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} className={`${control} mt-1`} /></label>
          <label className="text-sm font-medium text-forest-deeper">Notes <span className="font-normal text-stone">(optional)</span><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${control} mt-1`} /></label>
        </div><p className="text-xs text-stone">Listing location uses your saved Shop Setup location: {profile.region}, {profile.woreda}.</p>
        <div className="flex justify-end gap-3"><button type="button" onClick={() => { setFormOpen(false); setEditing(null) }} className="rounded-xl border border-forest/20 px-4 py-2.5 text-sm font-semibold text-forest">Cancel</button><button disabled={saving} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create listing'}</button></div>
      </>}
    </form>}
    <section aria-label="Listing statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SupplierStatCard title="Total Listings" value={loading ? '…' : listings.length} description="Products listed by your shop" tone="total" icon={StoreIcon} />
      <SupplierStatCard title="Active Listings" value={loading ? '…' : activeCount} description="Currently available to the marketplace" tone="active" icon={CheckCircleIcon} />
      <SupplierStatCard title="Paused Listings" value={loading ? '…' : pausedCount} description="Temporarily unavailable" tone="paused" icon={ClockIcon} />
      <SupplierStatCard title="Inactive Listings" value={loading ? '…' : inactiveCount} description="Not currently available" tone="inactive" icon={AlertIcon} />
    </section>
    <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-3"><label><span className="sr-only">Search by product</span><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product name" className={control} /></label><label><span className="sr-only">Filter category</span><select value={category} onChange={(e) => setCategory(e.target.value)} className={control}><option value="all">All categories</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span className="sr-only">Filter status</span><select value={status} onChange={(e) => setStatus(e.target.value)} className={control}><option value="all">All statuses</option><option value="active">Active</option><option value="paused">Paused</option><option value="inactive">Inactive</option></select></label></div>
      {loading ? <p role="status" className="py-12 text-center text-sm text-stone">Loading your listings…</p> : listings.length === 0 ? <div className="py-12 text-center"><h2 className="font-semibold text-forest-deeper">No listings yet</h2><p className="mt-1 text-sm text-stone">Add your first product to make your stock visible to the marketplace.</p><button onClick={openCreate} className="mt-4 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white">Add your first listing</button></div> : visible.length === 0 ? <p className="py-12 text-center text-sm text-stone">No listings match those filters.</p> : <div className="mt-5 overflow-x-auto rounded-xl border border-forest/10"><table className="w-full min-w-[760px] text-left"><thead className="bg-[#f7faf6] text-xs uppercase tracking-wide text-stone"><tr>{['Product', 'Category', 'Available', 'Price / unit', 'Status', 'Actions'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead><tbody className="divide-y divide-forest/10">{visible.map((item) => <tr key={item.id}><td className="px-4 py-4"><p className="font-semibold text-forest-deeper">{item.product_name}</p><p className="text-xs text-stone">Updated {new Date(item.updated_at).toLocaleDateString()}</p></td><td className="px-4 py-4 text-sm">{item.product_category ? categoryLabels[item.product_category] : '—'}</td><td className="px-4 py-4 text-sm">{item.available_quantity} {item.unit_code}</td><td className="px-4 py-4 text-sm">ETB {Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td className="px-4 py-4"><SupplierListingStatusBadge status={item.availability_status} /><label className="mt-2 block"><span className="sr-only">Change status for {item.product_name}</span><select aria-label={`Change status for ${item.product_name}`} value={item.availability_status === 'expired' ? 'inactive' : item.availability_status} onChange={(e) => void changeStatus(item, e.target.value as 'active' | 'paused' | 'inactive')} className={`${control} max-w-36 py-1.5 text-xs`}><option value="active">Active</option><option value="paused">Paused</option><option value="inactive">Inactive</option></select></label></td><td className="px-4 py-4"><div className="flex gap-3 text-sm font-semibold"><button onClick={() => openEdit(item)} className="text-forest underline">Edit</button><button onClick={() => void remove(item)} className="text-red-700 underline">Delete</button></div></td></tr>)}</tbody></table></div>}
      <p className="mt-3 text-xs text-stone">Showing {visible.length} of {listings.length} listings</p>
    </section>
  </div>
}
