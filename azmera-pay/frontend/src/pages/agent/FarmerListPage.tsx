import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listFarmers } from '../../api/farmers'
import FarmerList from '../../components/features/agent/FarmerList'
import type { Farmer } from '../../types/farmer'

export default function FarmerListPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
            My farmers
          </h1>
          <p className="mt-1 text-sm text-stone">
            Farmers registered under your workspace.
          </p>
        </div>

        <Link
          to="/agent/farmers/new"
          className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
        >
          Register farmer
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-stone">Loading farmers…</p>
      ) : error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load farmers. Please try again.
        </p>
      ) : (
        <FarmerList farmers={farmers} />
      )}
    </div>
  )
}