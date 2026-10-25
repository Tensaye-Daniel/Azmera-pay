import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FarmerRegistrationWizard from '../../components/features/agent/FarmerRegistrationWizard'
import Button from '../../components/ui/Button'
import { CheckIcon } from '../../components/ui/icons'
import type { Farmer } from '../../types/farmer'

export default function FarmerCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [registered, setRegistered] = useState<Farmer | null>(null)
  const [copied, setCopied] = useState(false)

  const copyAccountNumber = async () => {
    if (!registered) return
    try {
      await navigator.clipboard.writeText(registered.azmera_account_number)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (registered) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-forest/10 bg-white p-6 text-center shadow-[0_18px_50px_rgba(22,95,48,0.08)] sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint/60 text-forest-deeper">
            <CheckIcon className="size-7" />
          </span>

          <h1 className="mt-5 font-serif text-2xl font-semibold text-forest-deeper">
            {t('agent.farmerRegistered')}
          </h1>
          <p className="mt-1 text-sm text-stone">
            {registered.full_name} {t('agent.submittedForVerification')}
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-forest/15 bg-[#f7faf6] px-5 py-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone">
              {t('agent.azmeraAccountNumber')}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-forest-deeper">
              {registered.azmera_account_number}
            </p>
            <p className="mt-2 text-xs leading-5 text-stone">
              {t('agent.shareNumberNotice')}
            </p>

            <Button
              variant="secondary"
              className="mt-4"
              onClick={copyAccountNumber}
            >
              {copied ? t('agent.copied') : t('agent.copyNumber')}
            </Button>
          </div>

          <dl className="mx-auto mt-6 max-w-sm divide-y divide-forest/5 text-left text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-stone">{t('common.phone')}</dt>
              <dd className="font-medium text-stone-dark">{registered.phone}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-stone">{t('common.status')}</dt>
              <dd className="font-medium text-[#8a6d1b]">{t('common.pending')}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate(`/agent/farmers/${registered.id}`)}>
              {t('agent.viewFarmerDetails')}
            </Button>
            <Button variant="secondary" onClick={() => setRegistered(null)}>
              {t('agent.registerAnotherFarmer')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
            {t('agent.registerFarmer')}
          </h1>
          <p className="mt-1 text-sm text-stone">
            {t('agent.description')}
          </p>
        </div>

        <Link
          to="/agent/farmers"
          className="text-sm font-semibold text-forest transition-colors hover:text-forest-dark"
        >
          {t('agent.myFarmers')}
        </Link>
      </div>

      <FarmerRegistrationWizard onSuccess={setRegistered} />
    </div>
  )
}
