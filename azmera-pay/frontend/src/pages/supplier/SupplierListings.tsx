import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  StoreIcon,
  TagIcon,
  ArrowRightIcon,
} from '../../components/ui/icons'

export default function SupplierListings() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-forest">
            Supplier workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-forest-deeper">
            My Listings
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone">
            Manage the agricultural products, prices, and quantities you offer.
          </p>
        </div>

        <button
          type="button"
          disabled
          title="Listing creation will be enabled when the listing workflow is implemented."
          className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white opacity-60"
        >
          <span className="text-lg leading-none">+</span>
          Add listing
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">Total listings</p>
            <StoreIcon className="size-5 text-forest" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-forest-deeper">—</p>
          <p className="mt-2 text-xs text-stone">
            Will appear when listings are connected.
          </p>
        </article>

        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">Listed products</p>
            <TagIcon className="size-5 text-forest" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-forest-deeper">—</p>
          <p className="mt-2 text-xs text-stone">
            Product totals depend on your saved listings.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <label className="relative block">
            <span className="sr-only">Search listings</span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your listings..."
              className="w-full rounded-xl border border-forest/15 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10"
            />
          </label>

          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-forest/15 bg-white px-3 py-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-forest/20 bg-[#f7faf6] px-5 py-12 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint/50 text-forest-deeper">
            <StoreIcon className="size-7" />
          </div>

          <h2 className="mt-5 font-serif text-xl font-semibold text-forest-deeper">
            Your listings will appear here
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone">
            Once your supplier listings are available, you can review your
            products, update prices and quantities, and manage their status here.
          </p>

          <p className="mt-4 text-xs text-stone">
            Search: {search.trim() ? 'Ready to filter connected listings' : 'No search applied'}
            {' · '}
            Status: {status === 'all' ? 'All' : status}
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