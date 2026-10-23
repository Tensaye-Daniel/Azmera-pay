import { useEffect, useMemo, useState } from 'react'
import {
  activateFarmer,
  deactivateFarmer,
  listAdminFarmers,
  markFarmerPending,
  unverifyFarmer,
  verifyFarmer,
  type AdminFarmer,
  type FarmerStatus,
} from '../../api/admin'

const statusStyles: Record<FarmerStatus, string> = {
  registered: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  unverified: 'bg-slate-100 text-slate-700',
}

const AdminFarmers = () => {
  const [farmers, setFarmers] = useState<AdminFarmer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<FarmerStatus | 'all'>('all')
  const [region, setRegion] = useState('')
  const [query, setQuery] = useState({
    search: '',
    status: 'all' as FarmerStatus | 'all',
    region: '',
  })
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const params: Record<string, string> = {}
    if (query.status !== 'all') params.status = query.status
    if (query.search.trim()) params.search = query.search.trim()
    if (query.region.trim()) params.region = query.region.trim()
    listAdminFarmers(params)
      .then((data) => {
        if (!cancelled) {
          setFarmers(data)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load farmers')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  const applyFilters = () => {
    setLoading(true)
    setQuery({ search, status, region })
  }

  const filtered = useMemo(() => farmers, [farmers])

  const runAction = async (
    id: string,
    action: (id: string) => Promise<AdminFarmer>,
  ) => {
    setBusyId(id)
    try {
      const updated = await action(id)
      setFarmers((prev) =>
        prev.map((farmer) => (farmer.id === id ? updated : farmer)),
      )
    } catch {
      setError('Action failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Farmers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Verify registrations and control account access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, AZM, Fayda"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-64"
          />
          <input
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            placeholder="Region"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-40"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as FarmerStatus | 'all')
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="registered">Registered</option>
            <option value="pending">Pending</option>
            <option value="unverified">Unverified</option>
          </select>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Apply
          </button>
        </div>
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  Details
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-500" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-500" colSpan={5}>
                    No farmers found
                  </td>
                </tr>
              )}
              {filtered.map((farmer) => (
                <tr key={farmer.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{farmer.full_name}</p>
                    <p className="text-slate-500">{farmer.phone}</p>
                    <p className="text-xs text-slate-400">
                      AZM: {farmer.azmera_account_number}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{farmer.region}</p>
                    <p className="text-slate-500">{farmer.woreda}</p>
                    {farmer.kebele && (
                      <p className="text-slate-500">Kebele: {farmer.kebele}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">
                      Crop: {farmer.primary_crop}
                    </p>
                    <p className="text-slate-500">
                      Size: {farmer.farm_size_hectares} ha ·{' '}
                      {farmer.land_ownership}
                    </p>
                    {farmer.fayda_fin && (
                      <p className="text-slate-500">Fayda: {farmer.fayda_fin}</p>
                    )}
                    {farmer.registered_by_name && (
                      <p className="text-xs text-slate-400">
                        By {farmer.registered_by_name} ({farmer.registered_by_phone})
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[farmer.status]}`}
                    >
                      {farmer.status}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      {farmer.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {farmer.status !== 'registered' && (
                        <button
                          type="button"
                          disabled={busyId === farmer.id}
                          onClick={() => void runAction(farmer.id, verifyFarmer)}
                          className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      )}
                      {farmer.status !== 'pending' && (
                        <button
                          type="button"
                          disabled={busyId === farmer.id}
                          onClick={() => void runAction(farmer.id, markFarmerPending)}
                          className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                        >
                          Mark pending
                        </button>
                      )}
                      {farmer.status !== 'unverified' && (
                        <button
                          type="button"
                          disabled={busyId === farmer.id}
                          onClick={() => void runAction(farmer.id, unverifyFarmer)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Unverify
                        </button>
                      )}
                      {farmer.is_active ? (
                        <button
                          type="button"
                          disabled={busyId === farmer.id}
                          onClick={() => void runAction(farmer.id, deactivateFarmer)}
                          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === farmer.id}
                          onClick={() => void runAction(farmer.id, activateFarmer)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminFarmers
