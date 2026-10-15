import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getFarmer } from '../../api/farmers'
import FarmerForm from '../../components/features/agent/FarmerForm'
import { ArrowLeftIcon } from '../../components/ui/icons'
import type { Farmer } from '../../types/farmer'

export default function FarmerEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
    return <p className="text-sm text-stone">Loading farmer…</p>
  }

  if (error || !farmer) {
    return (
      <div className="space-y-4">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load this farmer.
        </p>
        <Link
          to="/agent/farmers"
          className="text-sm font-semibold text-forest hover:text-forest-dark"
        >
          Back to farmers
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to={`/agent/farmers/${farmer.id}`}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-forest transition-colors hover:bg-mint/30 hover:text-forest-dark"
      >
        <ArrowLeftIcon className="size-4" />
        Back to farmer
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
          Edit farmer
        </h1>
        <p className="mt-1 text-sm text-stone">{farmer.full_name}</p>
      </div>

      <FarmerForm
        mode="edit"
        initial={farmer}
        onSuccess={(saved) =>
          navigate(`/agent/farmers/${saved.id}`, { replace: true })
        }
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}