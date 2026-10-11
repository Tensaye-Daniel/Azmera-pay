import { useEffect, useState } from 'react'
import { ArrowRightIcon, UsersIcon, SproutIcon } from '../../components/ui/icons'
import { listFarmers } from '../../api/farmers'
import { useAuthStore } from '../../store/auth'

export default function AgentDashboard() {
  const user = useAuthStore((state) => state.user)
  const [farmerCount, setFarmerCount] = useState<number | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    listFarmers()
      .then((data) => {
        if (!cancelled) setFarmerCount(data.count)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

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

          <a
            href="/agent/farmers/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-forest-deeper transition-colors hover:bg-white"
          >
            Register a farmer
            <ArrowRightIcon className="size-4" />
          </a>
        </div>
      </section>

      <section aria-labelledby="overview-heading">
        <div className="mb-5">
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-forest/10 bg-white p-5 shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone">Registered farmers</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-forest-deeper">
                  {loadError ? '—' : farmerCount ?? '…'}
                </p>
              </div>
              <div className="grid size-11 place-items-center rounded-xl bg-mint/50 text-forest-deeper">
                <UsersIcon className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-stone">
              Farmers you have registered in your workspace.
            </p>
          </article>

          <article className="rounded-2xl border border-forest/10 bg-white p-5 shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-stone">Account number</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-forest-deeper">
                  AZM-…
                </p>
              </div>
              <div className="grid size-11 place-items-center rounded-xl bg-[#f1eed8] text-[#756b32]">
                <SproutIcon className="size-5" />
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-stone">
              Every farmer receives a unique Azmera account number on
              registration.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}