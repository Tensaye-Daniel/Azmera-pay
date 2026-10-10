import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  StoreIcon,
  TagIcon,
  ArrowRightIcon,
} from '../../components/ui/icons'
import StockListingForm, {
  type StockListingFormData,
} from '../../components/features/supplier/StockListingForm'

type Listing = StockListingFormData & {
  id: number
  status: 'active' | 'inactive'
}

export default function SupplierListings() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [listings, setListings] = useState<Listing[]>([])
  const [showForm, setShowForm] = useState(false)

  function handleAddListing(data: StockListingFormData) {
    const newListing: Listing = {
      ...data,
      id: Date.now(),
      status: 'active',
    }

    setListings((current) => [...current, newListing])
    setShowForm(false)
  }

  function toggleListingStatus(id: number) {
    setListings((current) =>
      current.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              status:
                listing.status === 'active' ? 'inactive' : 'active',
            }
          : listing,
      ),
    )
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.productName
      .toLowerCase()
      .includes(search.trim().toLowerCase())

    const matchesStatus = status === 'all' || listing.status === status

    return matchesSearch && matchesStatus
  })

  const uniqueProductCount = new Set(
    listings.map((listing) => listing.productName.toLowerCase()),
  ).size

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page heading */}
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
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark"
        >
          <span className="text-lg leading-none">
            {showForm ? '−' : '+'}
          </span>
          {showForm ? 'Close form' : 'Add listing'}
        </button>
      </section>

      {/* Add listing form */}
      {showForm && (
        <StockListingForm
          onSubmit={handleAddListing}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">Total listings</p>
            <StoreIcon className="size-5 text-forest" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-forest-deeper">
            {listings.length}
          </p>

          <p className="mt-2 text-xs text-stone">
            All listings you have added.
          </p>
        </article>

        <article className="rounded-2xl border border-forest/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone">Listed products</p>
            <TagIcon className="size-5 text-forest" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-forest-deeper">
            {uniqueProductCount}
          </p>

          <p className="mt-2 text-xs text-stone">
            Distinct products across your listings.
          </p>
        </article>
      </section>

      {/* Search and status filter */}
      <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <label>
            <span className="sr-only">Search listings</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your listings..."
              className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10"
            />
          </label>

          <label>
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

        {/* Listings table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-forest/10">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead className="bg-[#f7faf6]">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-stone">
                  Product
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-stone">
                  Quantity
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-stone">
                  Price / unit
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-stone">
                  Availability
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-stone">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-forest/10">
              {filteredListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="transition hover:bg-[#f7faf6]/70"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-forest-deeper">
                      {listing.productName}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-stone">
                    {listing.quantity} {listing.unit}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-stone">
                    ETB {listing.unitPrice.toFixed(2)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-stone">
                    <span>{listing.validFrom}</span>
                    <span className="mx-1">–</span>
                    <span>{listing.validTo}</span>
                  </td>

                  {/* Status is the final column */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          listing.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            listing.status === 'active'
                              ? 'bg-green-600'
                              : 'bg-stone-400'
                          }`}
                        />
                        {listing.status === 'active' ? 'Active' : 'Inactive'}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleListingStatus(listing.id)}
                        aria-label={`${
                          listing.status === 'active'
                            ? 'Deactivate'
                            : 'Activate'
                        } ${listing.productName}`}
                        className="whitespace-nowrap text-xs font-semibold text-forest underline-offset-4 hover:underline"
                      >
                        {listing.status === 'active'
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredListings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <StoreIcon className="mx-auto size-8 text-forest" />

                    <p className="mt-3 font-medium text-forest-deeper">
                      {listings.length === 0
                        ? 'No listings yet'
                        : 'No matching listings'}
                    </p>

                    <p className="mt-1 text-sm text-stone">
                      {listings.length === 0
                        ? 'Click Add listing to create your first product listing.'
                        : 'Try another product name or status filter.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-stone">
          Showing {filteredListings.length} of {listings.length} listings
        </p>

        <Link
          to="/supplier"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-dark"
        >
          Back to overview
          <ArrowRightIcon className="size-4" />
        </Link>
      </section>
    </div>
  )
}
