import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getFarmer } from '../../api/farmers'
import FarmerDetail from '../../components/features/agent/FarmerDetail'
import { ArrowLeftIcon } from '../../components/ui/icons'
import type { Farmer } from '../../types/farmer'

export default function FarmerDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getFarmer(id)
      .then((data) => {
        if (!cancelled) setFarmer(data)
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
  }, [id])

  if (loading) {
    return <p className="text-sm text-stone">{t('agent.loadingFarmer')}</p>
  }

  if (error || !farmer) {
    return (
      <div className="space-y-4">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('agent.couldNotLoadFarmer')}
        </p>
        <Link
          to="/agent/farmers"
          className="text-sm font-semibold text-forest hover:text-forest-dark"
        >
          {t('agent.backToFarmers')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/agent/farmers"
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-forest transition-colors hover:bg-mint/30 hover:text-forest-dark"
      >
        <ArrowLeftIcon className="size-4" />
        {t('agent.backToFarmers')}
      </Link>
      <FarmerDetail farmer={farmer} />
    </div>
  )
}