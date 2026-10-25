import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth'
import { getInitials } from '../../utils/farmer'

export default function AgentSettings() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
          {t('nav.settings')}
        </h1>
        <p className="mt-1 text-sm text-stone">
          {t('agent.settingsSubtitle')}
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
            <p className="mt-0.5 text-sm text-stone">{t('agent.agentAccount')}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 px-6 py-4 sm:grid-cols-2">
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              {t('agent.fullName')}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-stone-dark">
              {user?.full_name ?? '—'}
            </dd>
          </div>
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              {t('common.phone')}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-stone-dark">
              {user?.phone ?? '—'}
            </dd>
          </div>
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              {t('agent.role')}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-forest">
              {t('agent.agent')}
            </dd>
          </div>
          <div className="py-2.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
              {t('agent.workspace')}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-stone-dark">
              {t('nav.agentWorkspace')}
            </dd>
          </div>
        </dl>
      </section>

      <p className="text-xs leading-5 text-stone">
        {t('agent.moreSettingsNotice')}
      </p>
    </div>
  )
}