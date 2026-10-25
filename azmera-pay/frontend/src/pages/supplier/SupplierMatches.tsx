import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchSupplierMatches, supplierApiErrorMessage, type SupplierMatch } from '../../api/supplier'
import { ArrowRightIcon, NetworkIcon } from '../../components/ui/icons'

export default function SupplierMatches() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const targetMatchId = searchParams.get('matchId')
  const [matches, setMatches] = useState<SupplierMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptedMatchId, setAcceptedMatchId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetchSupplierMatches()
      .then((items) => { if (active) setMatches(items) })
      .catch((reason: unknown) => {
        if (active) setError(supplierApiErrorMessage(reason, 'Incoming matches could not be loaded.'))
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wider text-forest">{t('supplier.workspaceTitle')}</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-forest-deeper">{t('supplier.incomingMatches')}</h1>
        <p className="mt-2 text-sm leading-6 text-stone">
          {t('supplier.matchesIntro')}
        </p>
      </section>

      <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest-deeper">{t('supplier.potentialMatches')}</h2>
            <p className="mt-1 text-sm text-stone">{loading ? t('common.loading') : `${matches.length} incoming ${matches.length === 1 ? 'match' : 'matches'}`}</p>
          </div>
          <NetworkIcon className="size-6 text-forest" />
        </div>

        {loading ? (
          <p role="status" className="py-10 text-center text-sm text-stone">{t('common.loading')}</p>
        ) : error ? (
          <p role="alert" className="py-10 text-center text-sm text-red-800">{error}</p>
        ) : matches.length === 0 ? (
          <div className="py-10 text-center">
            <h3 className="font-semibold text-forest-deeper">{t('supplier.noMatchesYet')}</h3>
            <p className="mt-2 text-sm text-stone">{t('supplier.noMatchesDesc')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-forest/10">
            {matches.map((match) => {
              const isTargeted = match.id === targetMatchId
              return (
                <li
                  key={match.id}
                  className={`py-5 first:pt-0 last:pb-0 ${
                    isTargeted ? 'rounded-2xl border border-forest/20 bg-mint/10 p-4 my-2' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {isTargeted && (
                        <span className="mb-2 inline-block rounded-full bg-forest px-2.5 py-0.5 text-xs font-semibold text-white">
                          {t('supplier.selectedRequest')}
                        </span>
                      )}
                      <p className="font-semibold text-forest-deeper">
                        {t('supplier.requestFor')} {match.requested_product} <span className="font-normal text-stone">({match.requested_category})</span>
                      </p>
                      <p className="mt-1 text-sm text-stone">
                        {match.requested_quantity} {match.requested_unit} requested · Rank {match.rank}
                      </p>
                    </div>
                    <span className="rounded-full bg-mint/50 px-3 py-1 text-xs font-semibold capitalize text-forest-deeper">{match.status}</span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone">{t('supplier.requestLocation')}</dt>
                      <dd className="mt-1 text-forest-deeper">{[match.request_woreda, match.request_region].filter(Boolean).join(', ') || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone">{t('supplier.yourListing')}</dt>
                      <dd className="mt-1 text-forest-deeper">{match.listing_product} · {[match.listing_woreda, match.listing_region].filter(Boolean).join(', ') || 'Location unavailable'}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-forest/10 pt-3">
                    <p className="text-xs text-stone">
                      {t('supplier.reviewDetailsNotice')}
                    </p>
                    <button
                      type="button"
                      onClick={() => setAcceptedMatchId(match.id)}
                      className="rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      {t('supplier.acceptMatch')}
                    </button>
                  </div>

                  {acceptedMatchId === match.id && (
                    <div
                      role="status"
                      className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900"
                    >
                      <p className="font-semibold text-amber-950">
                        {t('supplier.paymentUnderDevTitle')}
                      </p>
                      <p className="mt-1 leading-5">
                        {t('supplier.paymentUnderDevDesc', {
                          product: match.requested_product,
                          quantity: match.requested_quantity,
                          unit: match.requested_unit,
                        })}
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Link to="/supplier" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-dark">
        {t('common.back')} <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  )
}
