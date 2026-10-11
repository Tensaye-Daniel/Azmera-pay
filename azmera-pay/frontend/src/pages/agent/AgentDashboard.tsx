import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  PhoneIcon,
  SproutIcon,
  UsersIcon,
} from '../../components/ui/icons'
import { getAgentSummary } from '../../api/farmers'
import { useAuthStore } from '../../store/auth'
import type { AgentSummary } from '../../types/farmer'
import {
  FARMER_STATUS_CLASSES,
  FARMER_STATUS_LABELS,
  getInitials,
} from '../../utils/farmer'

export default function AgentDashboard() {
  const user = useAuthStore((state) => state.user)
  const [summary, setSummary] = useState<AgentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchSummary = useCallback(
    () =>
      getAgentSummary()
        .then(setSummary)
        .catch(() => setError(true))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const handleRefresh = () => {
    setLoading(true)
    setError(false)
    fetchSummary()
  }

  const total = summary?.total ?? 0
  const pending = summary?.by_status.pending ?? 0
  const registered = summary?.by_status.registered ?? 0
  const unverified = summary?.by_status.unverified ?? 0

  const stats = [
    {
      label: 'Total farmers',
      value: total,
      icon: UsersIcon,
      tone: 'bg-mint/50 text-forest-deeper',
    },
    {
      label: 'Pending verification',
      value: pending,
      icon: ClockIcon,
      tone: 'bg-[#fdf2d4] text-[#8a6d1b]',
    },
    {
      label: 'Registered',
      value: registered,
      icon: CheckIcon,
      tone: 'bg-mint/50 text-forest-deeper',
    },
    {
      label: 'Unverified',
      value: unverified,
      icon: SproutIcon,
      tone: 'bg-[#f1eed8] text-[#756b32]',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-forest-deeper px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="bg-ethiopian-pattern pointer-events-none absolute inset-0 opacity-10" />

        <div className="relative max-w-2xl">
          <p className="mb-3 text-sm font-medium tracking-wide text-mint">
            AGENT WORKSPACE
          </p>

          <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            Welcome back, {user?.full_name?.split(' ')[0] ?? 'agent'}.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
            Register farmers and manage their profiles so they can access
            Azmera Pay by dialing USSD.
          </p>

          <Link
            to="/agent/farmers/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-forest-deeper transition-colors hover:bg-white"
          >
            Register a farmer
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="overview-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="overview-heading"
              className="font-serif text-2xl font-semibold text-forest-deeper"
            >
              Your overview
            </h2>
            <p className="mt-1 text-sm text-stone">
              A quick look at your farmer base.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deeper transition-colors hover:bg-mint/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load your overview.{' '}
            <button
              type="button"
              onClick={handleRefresh}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <article
                key={label}
                className="rounded-2xl border border-forest/10 bg-white p-5 shadow-[0_4px_20px_rgba(22,95,48,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-stone">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-forest-deeper">
                      {loading && !summary ? '…' : value}
                    </p>
                  </div>
                  <div
                    className={`grid size-11 place-items-center rounded-xl ${tone}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="recent-heading"
              className="font-serif text-2xl font-semibold text-forest-deeper"
            >
              Recent farmers
            </h2>
            <p className="mt-1 text-sm text-stone">
              The latest farmers you registered.
            </p>
          </div>

          {total > 0 && (
            <Link
              to="/agent/farmers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest transition-colors hover:text-forest-dark"
            >
              View all farmers
              <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </div>

        {loading && !summary ? (
          <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="flex items-center gap-4 border-b border-forest/5 px-5 py-4 last:border-b-0"
              >
                <div className="size-10 shrink-0 animate-pulse rounded-full bg-mint/40" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 animate-pulse rounded-full bg-mint/40" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-mint/30" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-forest/10 bg-white px-5 py-6 text-sm text-stone">
            Recent farmers could not be loaded.
          </p>
        ) : summary && summary.recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-forest/25 bg-white p-10 text-center">
            <p className="font-serif text-lg font-semibold text-forest-deeper">
              No farmers registered yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone">
              Register your first farmer to get started. Each farmer gets a
              unique Azmera account number they can use on USSD.
            </p>
            <Link
              to="/agent/farmers/new"
              className="mt-5 inline-block rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
            >
              Register a farmer
            </Link>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
            {summary?.recent.map((farmer) => (
              <li key={farmer.id}>
                <Link
                  to={`/agent/farmers/${farmer.id}`}
                  className="flex flex-wrap items-center gap-4 border-b border-forest/5 px-5 py-4 transition-colors last:border-b-0 hover:bg-mint/20"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint/60 text-sm font-semibold text-forest-deeper">
                    {getInitials(farmer.full_name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-forest-deeper">
                      {farmer.full_name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone">
                      <span className="flex items-center gap-1.5">
                        <PhoneIcon className="size-3.5" />
                        {farmer.phone}
                      </span>
                      <span className="font-mono">
                        {farmer.azmera_account_number}
                      </span>
                      <span>
                        {farmer.region}
                        {farmer.woreda ? ` · ${farmer.woreda}` : ''}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      FARMER_STATUS_CLASSES[farmer.status] ??
                      'bg-[#f1eed8] text-[#756b32]'
                    }`}
                  >
                    {FARMER_STATUS_LABELS[farmer.status] ?? farmer.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
