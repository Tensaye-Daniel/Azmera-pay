import { useEffect, useState, type ComponentType, type SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { getAdminSummary, type AdminSummary } from '../../api/admin'
import {
  AlertIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldIcon,
  SproutIcon,
  StoreIcon,
  TrendingIcon,
  UsersIcon,
} from '../../components/ui/icons'

interface StatCardProps {
  label: string
  value: number | string
  hint: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  accent: string
}

function StatCard({ label, value, hint, to, icon: Icon, accent }: StatCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-forest/10 bg-white p-5 shadow-[0_1px_2px_rgba(22,95,48,0.04)] transition hover:-translate-y-0.5 hover:border-forest/20 hover:shadow-lg sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone">{label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-forest-deeper">
            {value}
          </p>
        </div>
        <span className={`grid size-11 place-items-center rounded-xl ${accent}`}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-stone">{hint}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-forest opacity-0 transition group-hover:opacity-100">
        Open queue
        <ArrowRightIcon className="size-3.5" />
      </span>
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
  const pendingTotal = pendingFarmers + pendingSuppliers
  const verifiedFarmers = summary?.farmers.by_status.registered ?? 0
  const agentCount = summary?.users.by_role.agent ?? 0

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
          Platform overview
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-forest-deeper sm:text-4xl">
          Review queue
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone">
          Verify farmer registrations and supplier applications before they can
          trade on Azmera. Open a queue to inspect details and documents.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {pendingTotal > 0 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <AlertIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-950">
                {pendingTotal} application{pendingTotal === 1 ? '' : 's'} waiting
                for review
              </p>
              <p className="mt-0.5 text-xs leading-5 text-amber-800">
                Clear the oldest requests first so registrations are not delayed.
              </p>
            </div>
          </div>
          <Link
            to={pendingFarmers > 0 ? '/farmers' : '/suppliers'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            Start review
            <ArrowRightIcon className="size-4" />
          </Link>
        </section>
      )}

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Farmers pending"
          value={summary ? pendingFarmers : '—'}
          hint={`${summary?.farmers.total ?? '—'} farmers registered in total`}
          to="/farmers"
          icon={SproutIcon}
          accent="bg-mint/50 text-forest-deeper"
        />
        <StatCard
          label="Suppliers pending"
          value={summary ? pendingSuppliers : '—'}
          hint={`${summary?.suppliers.total ?? '—'} supplier accounts in total`}
          to="/suppliers"
          icon={StoreIcon}
          accent="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Verified farmers"
          value={summary ? verifiedFarmers : '—'}
          hint={`${agentCount} field agents registered farmers`}
          to="/farmers"
          icon={CheckCircleIcon}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Platform users"
          value={summary?.users.total ?? '—'}
          hint={`${summary?.users.by_role.farmer ?? 0} farmers · ${summary?.users.by_role.supplier ?? 0} suppliers`}
          to="/users"
          icon={UsersIcon}
          accent="bg-[#f1f5f9] text-slate-700"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-forest/10 text-forest-deeper">
              <TrendingIcon className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest-deeper">
                Review queues
              </h2>
              <p className="text-xs text-stone">Keep approvals moving</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              to="/farmers"
              className="flex items-center justify-between gap-4 rounded-xl border border-forest/10 bg-[#f7faf6] px-4 py-3 transition hover:border-forest/25 hover:bg-mint/20"
            >
              <div>
                <p className="text-sm font-semibold text-forest-deeper">
                  Farmer registrations
                </p>
                <p className="text-xs text-stone">
                  {pendingFarmers} pending review
                </p>
              </div>
              <ArrowRightIcon className="size-4 text-forest" />
            </Link>
            <Link
              to="/suppliers"
              className="flex items-center justify-between gap-4 rounded-xl border border-forest/10 bg-[#f7faf6] px-4 py-3 transition hover:border-forest/25 hover:bg-mint/20"
            >
              <div>
                <p className="text-sm font-semibold text-forest-deeper">
                  Supplier applications
                </p>
                <p className="text-xs text-stone">
                  {pendingSuppliers} pending review
                </p>
              </div>
              <ArrowRightIcon className="size-4 text-forest" />
            </Link>
            <Link
              to="/users"
              className="flex items-center justify-between gap-4 rounded-xl border border-forest/10 bg-[#f7faf6] px-4 py-3 transition hover:border-forest/25 hover:bg-mint/20"
            >
              <div>
                <p className="text-sm font-semibold text-forest-deeper">
                  User access
                </p>
                <p className="text-xs text-stone">
                  {summary?.users.total ?? '—'} accounts on the platform
                </p>
              </div>
              <ArrowRightIcon className="size-4 text-forest" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-forest/10 bg-forest-deeper p-5 text-white sm:p-6">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-gold">
            <ShieldIcon className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-xl font-semibold">
            A trusted marketplace
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Every approval protects farmers, buyers and suppliers. Check names,
            locations and supporting documents before granting access.
          </p>
          <Link
            to="/farmers"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-forest-deeper transition hover:bg-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-forest-deeper"
          >
            Review farmers
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
