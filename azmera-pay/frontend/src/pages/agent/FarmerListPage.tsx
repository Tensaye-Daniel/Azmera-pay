import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { listFarmers } from '../../api/farmers'
import FarmerList from '../../components/features/agent/FarmerList'
import type { Farmer } from '../../types/farmer'

export default function FarmerListPage() {
  const { t } = useTranslation()
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    listFarmers()
      .then((data) => {
        if (!cancelled) setFarmers(data.results)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = () => {
    setLoading(true)
    setError(false)
    setReloadKey((key) => key + 1)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
            {t('agent.myFarmers')}
          </h1>
          <p className="mt-1 text-sm text-stone">
            {t('agent.registeredUnderWorkspace')}
          </p>
        </div>

        <Link
          to="/agent/farmers/new"
          className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
        >
          {t('agent.registerFarmer')}
        </Link>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b border-forest/5 px-5 py-4 last:border-b-0"
            >
              <div className="size-10 shrink-0 animate-pulse rounded-full bg-mint/40" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-40 max-w-[60%] animate-pulse rounded-full bg-mint/40" />
                <div className="h-3 w-28 max-w-[40%] animate-pulse rounded-full bg-mint/30" />
              </div>
              <div className="h-6 w-24 shrink-0 animate-pulse rounded-full bg-mint/30" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('agent.failedToLoadFarmers')}{' '}
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline underline-offset-2"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      ) : (
        <FarmerList farmers={farmers} />
      )}
    </div>
  )
}