import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchMe } from '../../api/auth'
import {
  fetchSupplierInventorySummary,
  fetchSupplierListings,
  fetchSupplierProfile,
  supplierApiErrorMessage,
  type SupplierInventorySummary,
  type SupplierListing,
  type SupplierProfile,
} from '../../api/supplier'
import { useAuthStore } from '../../store/auth'
import SupplierStatCard from '../../components/features/supplier/SupplierStatCard'
import SupplierListingStatusBadge from '../../components/features/supplier/SupplierListingStatusBadge'
import {
  AlertIcon,
  CheckCircleIcon,
  ClockIcon,
  StoreIcon,
} from '../../components/ui/icons'

export default function SupplierDashboard() {
  const { t } = useTranslation()
  const cachedUser = useAuthStore((state) => state.user)
  const [name, setName] = useState(cachedUser?.full_name ?? '')
  const [shop, setShop] = useState<SupplierProfile | null>(null)
  const [listings, setListings] = useState<SupplierListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [listingsError, setListingsError] = useState(false)
  const [profileError, setProfileError] = useState(false)
  const [inventorySummary, setInventorySummary] =
    useState<SupplierInventorySummary | null>(null)
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [inventoryError, setInventoryError] = useState('')

  useEffect(() => {
    let active = true
    void Promise.allSettled([
      fetchMe(),
      fetchSupplierProfile(),
      fetchSupplierListings(),
    ])
      .then(([userResult, profileResult, listingsResult]) => {
        if (!active) return

        const errors: string[] = []
        if (userResult.status === 'fulfilled') {
          setName(userResult.value.full_name)
        } else {
          errors.push(
            supplierApiErrorMessage(
              userResult.reason,
              'Your account name could not be loaded.',
            ),
          )
        }

        if (profileResult.status === 'fulfilled') {
          setShop(profileResult.value)
          setProfileError(false)
        } else {
          setProfileError(true)
          errors.push(
            supplierApiErrorMessage(
              profileResult.reason,
              'Your shop details could not be loaded.',
            ),
          )
        }

        if (listingsResult.status === 'fulfilled') {
          setListings(listingsResult.value)
          setListingsError(false)
        } else {
          setListingsError(true)
          errors.push(
            supplierApiErrorMessage(
              listingsResult.reason,
              'Your listings could not be loaded.',
            ),
          )
        }

        if (errors.length) {
          setError(errors.join(' '))
        } else {
          setError('')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    void fetchSupplierInventorySummary()
      .then((summary) => {
        if (active) {
          setInventorySummary(summary)
          setInventoryError('')
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setInventoryError(
            supplierApiErrorMessage(
              reason,
              'Inventory summary could not be loaded. Refresh to try again.',
            ),
          )
        }
      })
      .finally(() => {
        if (active) setInventoryLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const inventoryValue = (count: number | undefined) =>
    inventoryLoading ? '…' : inventoryError ? '—' : (count ?? 0)

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="rounded-3xl bg-forest-deeper px-6 py-8 text-white sm:px-9 sm:py-10">
        <p className="text-sm font-medium tracking-wide text-mint uppercase">
          {t('supplier.workspaceTitle')}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
          {t('supplier.welcomeName', { name: name || 'supplier' })}
        </h1>
        <p className="mt-2 text-white/80">
          {shop?.company_name || t('supplier.yourShop')} · {t('supplier.keepProductsUpdated')}
        </p>
        <Link
          to="/supplier/listings"
          className="mt-6 inline-flex rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-forest-deeper"
        >
          {t('supplier.addListingBtn')}
        </Link>
      </section>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {inventoryError && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {inventoryError}
        </p>
      )}

      <section
        aria-label="Listing statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SupplierStatCard
          title={t('supplier.totalListings')}
          value={inventoryValue(inventorySummary?.total)}
          description={t('supplier.totalListingsDesc')}
          tone="total"
          icon={StoreIcon}
        />
        <SupplierStatCard
          title={t('supplier.activeListings')}
          value={inventoryValue(inventorySummary?.active)}
          description={t('supplier.activeListingsDesc')}
          tone="active"
          icon={CheckCircleIcon}
        />
        <SupplierStatCard
          title={t('supplier.pausedListings')}
          value={inventoryValue(inventorySummary?.paused)}
          description={t('supplier.pausedListingsDesc')}
          tone="paused"
          icon={ClockIcon}
        />
        <SupplierStatCard
          title={t('supplier.inactiveListings')}
          value={inventoryValue(inventorySummary?.inactive)}
          description={t('supplier.inactiveListingsDesc')}
          tone="inactive"
          icon={AlertIcon}
        />
      </section>

      {!inventoryLoading &&
        !inventoryError &&
        inventorySummary?.total === 0 && (
          <p
            role="status"
            className="rounded-xl bg-[#f7faf6] p-4 text-sm text-stone"
          >
            {t('supplier.emptyInventory')}
          </p>
        )}

      <section className="rounded-2xl border border-forest/10 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest-deeper">
              {t('supplier.recentlyUpdated')}
            </h2>
            <p className="mt-1 text-sm text-stone">
              {t('supplier.latestListings')}
            </p>
          </div>
          <Link
            to="/supplier/listings"
            className="text-sm font-semibold text-forest underline"
          >
            {t('supplier.allListingsLink')}
          </Link>
        </div>

        {loading ? (
          <p role="status" className="py-8 text-sm text-stone">
            {t('common.loading')}
          </p>
        ) : listingsError ? (
          <p role="alert" className="py-8 text-sm text-red-800">
            {t('common.error')}
          </p>
        ) : listings.length === 0 ? (
          <div className="mt-5 rounded-xl bg-[#f7faf6] p-5">
            <p className="font-semibold text-forest-deeper">
              {t('supplier.shopReadyFirst')}
            </p>
            <p className="mt-1 text-sm text-stone">
              {t('supplier.shopReadyDesc')}
            </p>
            <Link
              to="/supplier/listings"
              className="mt-4 inline-flex text-sm font-semibold text-forest underline"
            >
              {t('supplier.createListing')}
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-forest/10">
            {[...listings]
              .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
              .slice(0, 5)
              .map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest-deeper">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-stone">
                      {item.available_quantity} {item.unit_code} · Updated{' '}
                      {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <SupplierListingStatusBadge
                    status={item.availability_status}
                  />
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-forest/10 bg-white p-5">
        <h2 className="font-semibold text-forest-deeper">{t('supplier.shopDetails')}</h2>
        {profileError ? (
          <p role="alert" className="mt-3 text-sm text-red-800">
            {t('common.error')}
          </p>
        ) : (
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-stone">{t('supplier.personalName')}:</span>{' '}
              {name || '—'}
            </p>
            <p>
              <span className="text-stone">{t('supplier.businessNameLabel')}:</span>{' '}
              {shop?.company_name || '—'}
            </p>
            <p>
              <span className="text-stone">{t('supplier.locationLabel')}:</span>{' '}
              {shop ? `${shop.region}, ${shop.woreda}` : '—'}
            </p>
            <p>
              <span className="text-stone">{t('supplier.configuredCategories')}:</span>{' '}
              {shop?.product_categories.length ?? '—'}
            </p>
          </div>
        )}
        <Link
          to="/supplier/shop-setup"
          className="mt-4 inline-flex text-sm font-semibold text-forest underline"
        >
          {t('supplier.manageShopSetup')}
        </Link>
      </section>
    </div>
  )
}
