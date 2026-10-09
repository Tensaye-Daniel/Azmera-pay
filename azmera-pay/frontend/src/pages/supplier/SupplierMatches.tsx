
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  NetworkIcon,
  TagIcon,
} from '../../components/ui/icons'

export default function SupplierMatches() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wider text-forest">
          Supplier workspace
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold text-forest-deeper">
          Matches
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone">
          Review matching opportunities between your listings and buyer
          requests.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">
              Matching opportunities
            </p>
            <NetworkIcon className="size-5 text-forest" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-forest-deeper">—</p>

          <p className="mt-2 text-xs text-stone">
            Match totals will appear when matching data is connected.
          </p>
        </article>

        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">
              Related products
            </p>
            <TagIcon className="size-5 text-forest" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-forest-deeper">—</p>

          <p className="mt-2 text-xs text-stone">
            Product totals will appear when match data is available.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-forest/10 bg-white p-6 sm:p-8">
        <div className="mx-auto max-w-lg py-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint/50 text-forest-deeper">
            <NetworkIcon className="size-7" />
          </div>

          <h2 className="mt-5 font-serif text-xl font-semibold text-forest-deeper">
            No matches to display yet
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone">
            Matching opportunities will appear here when the matching engine
            provides results. You can then review the opportunities related to
            your products.
          </p>

          <Link
            to="/supplier"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-dark"
          >
            Back to overview
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}