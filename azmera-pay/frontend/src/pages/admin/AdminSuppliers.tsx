import { useEffect, useMemo, useState } from 'react'
import {
  activateSupplier,
  approveSupplier,
  deactivateSupplier,
  listAdminSuppliers,
  rejectSupplier,
  type AdminSupplier,
  type SupplierApprovalStatus,
} from '../../api/admin'

const approvalStyles: Record<SupplierApprovalStatus, string> = {
  not_required: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
}

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [approval, setApproval] = useState<SupplierApprovalStatus | 'all'>(
    'all',
  )
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [query, setQuery] = useState({
    search: '',
    approval: 'all' as SupplierApprovalStatus | 'all',
    status: 'all' as 'all' | 'active' | 'inactive',
  })
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const params: Record<string, string> = {}
    if (query.approval !== 'all') params.approval = query.approval
    if (query.status !== 'all') params.status = query.status
    if (query.search.trim()) params.search = query.search.trim()
    listAdminSuppliers(params)
      .then((data) => {
        if (!cancelled) {
          setSuppliers(data)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load suppliers')
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
    setQuery({ search, approval, status })
  }

  const filtered = useMemo(() => suppliers, [suppliers])

  const runAction = async (
    id: string,
    action: (id: string) => Promise<AdminSupplier>,
  ) => {
    setBusyId(id)
    try {
      const updated = await action(id)
      setSuppliers((prev) =>
        prev.map((supplier) => (supplier.id === id ? updated : supplier)),
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
          <h1 className="text-2xl font-semibold text-slate-900">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Approve or reject supplier applications and control access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, TIN, phone"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-64"
          />
          <select
            value={approval}
            onChange={(event) =>
              setApproval(event.target.value as SupplierApprovalStatus | 'all')
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All approvals</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="not_required">Not required</option>
          </select>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as 'all' | 'active' | 'inactive')
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All accounts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                  Supplier
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  Business
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  Location
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
                    No suppliers found
                  </td>
                </tr>
              )}
              {filtered.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {supplier.full_name}
                    </p>
                    <p className="text-slate-500">{supplier.phone}</p>
                    {supplier.email && (
                      <p className="text-slate-500">{supplier.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {supplier.company_name}
                    </p>
                    <p className="text-slate-500">TIN: {supplier.tin_number}</p>
                    {supplier.product_categories.length > 0 && (
                      <p className="text-xs text-slate-400">
                        {supplier.product_categories.join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{supplier.region || '-'}</p>
                    <p className="text-slate-500">{supplier.woreda || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${approvalStyles[supplier.supplier_approval_status]}`}
                    >
                      {supplier.supplier_approval_status}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {supplier.supplier_approval_status !== 'approved' && (
                        <button
                          type="button"
                          disabled={busyId === supplier.id}
                          onClick={() => void runAction(supplier.id, approveSupplier)}
                          className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {supplier.supplier_approval_status !== 'rejected' && (
                        <button
                          type="button"
                          disabled={busyId === supplier.id}
                          onClick={() => void runAction(supplier.id, rejectSupplier)}
                          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      {supplier.is_active ? (
                        <button
                          type="button"
                          disabled={busyId === supplier.id}
                          onClick={() =>
                            void runAction(supplier.id, deactivateSupplier)
                          }
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === supplier.id}
                          onClick={() => void runAction(supplier.id, activateSupplier)}
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

export default AdminSuppliers
