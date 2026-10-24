
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchSupplierMatches,
  supplierApiErrorMessage,
  type SupplierMatch,
} from '../../api/supplier'
import { ArrowRightIcon, ClockIcon, UsersIcon } from '../../components/ui/icons'

export default function SupplierRequests() {
  const [matches, setMatches] = useState<SupplierMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void fetchSupplierMatches()
      .then((items) => {
        if (active) setMatches(items)
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            supplierApiErrorMessage(
              reason,
              'Incoming requests could not be loaded.',
            ),
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const uniqueRequestCount = new Set(matches.map((item) => item.request_id)).size
  const pendingMatchCount = matches.filter((item) => item.status === 'pending').length

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wider text-forest">
          Supplier workspace
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold text-forest-deeper">
          Requests
        </h1>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">
              Incoming requests
            </p>
            <UsersIcon className="size-5 text-forest" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-forest-deeper">
            {loading ? '…' : uniqueRequestCount}
          </p>

          <p className="mt-2 text-xs text-stone">
            {loading
              ? 'Loading request totals…'
              : `${uniqueRequestCount} unique ${uniqueRequestCount === 1 ? 'request' : 'requests'} across ${matches.length} ${matches.length === 1 ? 'match' : 'matches'}.`}
          </p>
        </article>

        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">
              Awaiting response
            </p>
            <ClockIcon className="size-5 text-forest" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-forest-deeper">
            {loading ? '…' : pendingMatchCount}
          </p>

          <p className="mt-2 text-xs text-stone">
            {loading
              ? 'Loading response totals…'
              : `${pendingMatchCount} pending ${pendingMatchCount === 1 ? 'match' : 'matches'} awaiting review.`}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest-deeper">
              Incoming requests
            </h2>
            <p className="mt-1 text-sm text-stone">
              {loading
                ? 'Loading requests…'
                : `${uniqueRequestCount} ${uniqueRequestCount === 1 ? 'request' : 'requests'} (${matches.length} incoming ${matches.length === 1 ? 'match' : 'matches'})`}
            </p>
          </div>
          <UsersIcon className="size-6 text-forest" />
        </div>

        {loading ? (
          <p role="status" className="py-10 text-center text-sm text-stone">
            Loading your incoming requests…
          </p>
        ) : error ? (
          <p role="alert" className="py-10 text-center text-sm text-red-800">
            {error} Reload the page to try again.
          </p>
        ) : matches.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint/50 text-forest-deeper">
              <UsersIcon className="size-7" />
            </div>

            <h3 className="mt-5 font-serif text-xl font-semibold text-forest-deeper">
              No requests to display yet
            </h3>

            <p className="mt-2 text-sm leading-6 text-stone">
              Incoming requests will appear here when farmer input requests match
              your active product listings.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-forest/10">
            {matches.map((match) => (
              <li key={match.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-forest-deeper">
                      Request for {match.requested_product}{' '}
                      <span className="font-normal text-stone">
                        ({match.requested_category})
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-stone">
                      {match.requested_quantity} {match.requested_unit} requested · Rank {match.rank}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-mint/50 px-3 py-1 text-xs font-semibold capitalize text-forest-deeper">
                      {match.status}
                    </span>
                    <Link
                      to={`/supplier/matches?matchId=${match.id}`}
                      className="rounded-xl bg-forest px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-forest-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      Accept
                    </Link>
                  </div>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone">
                      Request location
                    </dt>
                    <dd className="mt-1 text-forest-deeper">
                      {[match.request_woreda, match.request_region].filter(Boolean).join(', ') || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stone">
                      Target listing
                    </dt>
                    <dd className="mt-1 text-forest-deeper">
                      {match.listing_product} · {[match.listing_woreda, match.listing_region].filter(Boolean).join(', ') || 'Location unavailable'}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        to="/supplier"
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-dark"
      >
        Back to overview
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  )
}