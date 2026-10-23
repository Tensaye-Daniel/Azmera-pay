import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMe } from '../../api/auth'
import { fetchSupplierInventorySummary, fetchSupplierListings, fetchSupplierProfile, type SupplierInventorySummary, type SupplierListing, type SupplierProfile } from '../../api/supplier'
import { useAuthStore } from '../../store/auth'
import SupplierStatCard from '../../components/features/supplier/SupplierStatCard'
import SupplierListingStatusBadge from '../../components/features/supplier/SupplierListingStatusBadge'
import { AlertIcon, CheckCircleIcon, ClockIcon, StoreIcon } from '../../components/ui/icons'

export default function SupplierDashboard() {
  const cachedUser = useAuthStore((state) => state.user)
  const [name, setName] = useState(cachedUser?.full_name ?? '')
  const [shop, setShop] = useState<SupplierProfile | null>(null)
  const [listings, setListings] = useState<SupplierListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inventorySummary, setInventorySummary] = useState<SupplierInventorySummary | null>(null)
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [inventoryError, setInventoryError] = useState('')

  useEffect(() => {
    let active = true
    void Promise.all([fetchMe(), fetchSupplierProfile(), fetchSupplierListings()]).then(([user, profile, items]) => {
      if (!active) return
      setName(user.full_name); setShop(profile); setListings(items)
    }).catch(() => { if (active) setError('Some account information could not be loaded. Refresh to try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void fetchSupplierInventorySummary()
      .then((summary) => { if (active) setInventorySummary(summary) })
      .catch(() => { if (active) setInventoryError('Inventory summary could not be loaded. Refresh to try again.') })
      .finally(() => { if (active) setInventoryLoading(false) })
    return () => { active = false }
  }, [])

  const inventoryValue = (count: number | undefined) => inventoryLoading ? '…' : inventoryError ? '—' : count ?? 0
  return <div className="mx-auto max-w-6xl space-y-7">
    <section className="rounded-3xl bg-forest-deeper px-6 py-8 text-white sm:px-9 sm:py-10">
      <p className="text-sm font-medium tracking-wide text-mint">SUPPLIER WORKSPACE</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">Welcome, {name || 'supplier'}</h1>
      <p className="mt-2 text-white/80">{shop?.company_name || 'Your shop'} · Keep your products and availability up to date.</p>
      <Link to="/supplier/listings" className="mt-6 inline-flex rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-forest-deeper">Add a listing</Link>
    </section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {inventoryError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{inventoryError}</p>}
    <section aria-label="Listing statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SupplierStatCard title="Total Listings" value={inventoryValue(inventorySummary?.total)} description="Products listed by your shop" tone="total" icon={StoreIcon} />
      <SupplierStatCard title="Active Listings" value={inventoryValue(inventorySummary?.active)} description="Currently available to the marketplace" tone="active" icon={CheckCircleIcon} />
      <SupplierStatCard title="Paused Listings" value={inventoryValue(inventorySummary?.paused)} description="Temporarily unavailable" tone="paused" icon={ClockIcon} />
      <SupplierStatCard title="Inactive Listings" value={inventoryValue(inventorySummary?.inactive)} description="Not currently available" tone="inactive" icon={AlertIcon} />
    </section>
    {!inventoryLoading && !inventoryError && inventorySummary?.total === 0 && <p role="status" className="rounded-xl bg-[#f7faf6] p-4 text-sm text-stone">Your inventory is empty. Add a listing to see it reflected in these totals.</p>}
    <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-serif text-xl font-semibold text-forest-deeper">Recently updated</h2><p className="mt-1 text-sm text-stone">Your latest product listings.</p></div><Link to="/supplier/listings" className="text-sm font-semibold text-forest underline">All listings</Link></div>
      {loading ? <p role="status" className="py-8 text-sm text-stone">Loading account activity…</p> : listings.length === 0 ? <div className="mt-5 rounded-xl bg-[#f7faf6] p-5"><p className="font-semibold text-forest-deeper">Your shop is ready for its first listing</p><p className="mt-1 text-sm text-stone">Add a product name, category, price, and available quantity to get started.</p><Link to="/supplier/listings" className="mt-4 inline-flex text-sm font-semibold text-forest underline">Create a listing</Link></div> : <ul className="mt-4 divide-y divide-forest/10">{[...listings].sort((a,b) => b.updated_at.localeCompare(a.updated_at)).slice(0,5).map((item) => <li key={item.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate font-medium text-forest-deeper">{item.product_name}</p><p className="text-xs text-stone">{item.available_quantity} {item.unit_code} · Updated {new Date(item.updated_at).toLocaleDateString()}</p></div><SupplierListingStatusBadge status={item.availability_status} /></li>)}</ul>}
    </section>
    <section className="rounded-2xl border border-forest/10 bg-white p-5"><h2 className="font-semibold text-forest-deeper">Shop details</h2><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><span className="text-stone">Personal name:</span> {name || '—'}</p><p><span className="text-stone">Business name:</span> {shop?.company_name || '—'}</p><p><span className="text-stone">Location:</span> {shop ? `${shop.region}, ${shop.woreda}` : '—'}</p><p><span className="text-stone">Configured categories:</span> {shop?.product_categories.length ?? '—'}</p></div><Link to="/supplier/shop-setup" className="mt-4 inline-flex text-sm font-semibold text-forest underline">Manage Shop Setup</Link></section>
  </div>
}
