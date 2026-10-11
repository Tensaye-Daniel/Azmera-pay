import { useAuthStore } from '../../store/auth'
import { getInitials } from '../../utils/farmer'

export default function AgentSettings() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
          Settings
        </h1>
        <p className="mt-1 text-sm text-stone">
          Your account details and agent workspace preferences.
        </p>
      </div>

      <section className="rounded-2xl border border-forest/10 bg-white shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
        <div className="flex flex-wrap items-center gap-4 border-b border-forest/10 bg-[#f7faf6] px-6 py-5">
          <span className="grid size-14 place-items-center rounded-full bg-mint/60 text-lg font-semibold text-forest-deeper">
            {getInitials(user?.full_name ?? 'Agent')}
          </span>
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest-deeper">
              {user?.full_name}
            </h2>
            <p className="mt-0.5 text-sm text-stone">Agent account</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 px-6 py-4 sm:grid-cols-2">
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              Full name
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-stone-dark">
              {user?.full_name ?? '—'}
            </dd>
          </div>
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              Phone number
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-stone-dark">
              {user?.phone ?? '—'}
            </dd>
          </div>
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              Role
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-forest">
              Agent
            </dd>
          </div>
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              Workspace
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-stone-dark">
              Agent workspace
            </dd>
          </div>
        </dl>
      </section>

      <p className="text-xs leading-5 text-stone">
        More settings - such as output and network preferences - will appear
        here in a future release.
      </p>
    </div>
  )
}