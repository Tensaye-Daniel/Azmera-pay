import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminSummary, type AdminSummary } from '../../api/admin'

interface StatCardProps {
  label: string
  value: number | string
  hint: string
  to: string
  accent: string
}

function StatCard({ label, value, hint, to, accent }: StatCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={`grid size-10 place-items-center rounded-xl text-sm font-semibold ${accent}`}
        >
          {typeof value === 'number' ? value : '—'}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{hint}</p>
      <p className="mt-4 text-xs font-medium text-emerald-700 opacity-0 transition group-hover:opacity-100">
        Open review queue →
      </p>
    </Link>
  )
}

const AdminDashboard = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load dashboard counters')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pendingFarmers = summary?.farmers.by_status.pending ?? 0
  const pendingSuppliers = summary?.suppliers.by_approval.pending ?? 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review registrations with full farmer details and encrypted
          supporting documents before approving access.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {(pendingFarmers > 0 || pendingSuppliers > 0) && (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {pendingFarmers + pendingSuppliers} application
              {pendingFarmers + pendingSuppliers === 1 ? '' : 's'} waiting for
              review
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Open a queue, inspect the details and documents, then approve.
            </p>
          </div>
          <Link
            to={pendingFarmers > 0 ? '/farmers' : '/suppliers'}
            className="rounded-lg bg-amber-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Start review
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Farmers pending"
          value={summary ? pendingFarmers : '—'}
          hint={`${summary?.farmers.total ?? '—'} total farmers registered`}
          to="/farmers"
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Suppliers pending"
          value={summary ? pendingSuppliers : '—'}
          hint={`${summary?.suppliers.total ?? '—'} total supplier accounts`}
          to="/suppliers"
          accent="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Platform users"
          value={summary?.users.total ?? '—'}
          hint={`${summary?.users.by_role.agent ?? 0} agents · ${
            summary?.users.by_role.farmer ?? 0
          } farmers`}
          to="/users"
          accent="bg-slate-100 text-slate-700"
        />
      </div>
    </div>
  )
}

export default AdminDashboard
