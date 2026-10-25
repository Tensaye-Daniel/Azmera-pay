import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  listAdminFarmers,
  listAdminSuppliers,
  listAdminUsers,
  type AdminFarmer,
  type AdminSupplier,
  type AdminUser,
} from '../../api/admin'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  SproutIcon,
  StoreIcon,
  UsersIcon,
} from '../../components/ui/icons'
import EmptyState from '../../components/ui/EmptyState'
import Notice from '../../components/ui/Notice'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'

interface Overview {
  farmers: AdminFarmer[]
  suppliers: AdminSupplier[]
  users: AdminUser[]
}

const emptyOverview: Overview = { farmers: [], suppliers: [], users: [] }

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [overview, setOverview] = useState<Overview>(emptyOverview)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    void Promise.allSettled([
      listAdminFarmers(),
      listAdminSuppliers(),
      listAdminUsers(),
    ])
      .then(([farmers, suppliers, users]) => {
        if (!active) return
        setOverview({
          farmers: farmers.status === 'fulfilled' ? farmers.value : [],
          suppliers: suppliers.status === 'fulfilled' ? suppliers.value : [],
          users: users.status === 'fulfilled' ? users.value : [],
        })
        setError(
          farmers.status === 'rejected' ||
            suppliers.status === 'rejected' ||
            users.status === 'rejected',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  const reload = () => {
    setLoading(true)
    setError(false)
    setReloadKey((key) => key + 1)
  }

  const pendingFarmers = overview.farmers.filter(
    (farmer) => farmer.status !== 'registered',
  ).length
  const pendingSuppliers = overview.suppliers.filter(
    (supplier) => supplier.supplier_approval_status === 'pending',
  ).length
  const activeAccounts =
    overview.users.filter((user) => user.is_active).length

  const value = (count: number) => (loading ? '…' : count)

  const quickLinks = [
    {
      to: '/admin/farmers',
      icon: SproutIcon,
      title: t('nav.farmers'),
      description: t('admin.farmersCardDesc'),
      count: loading ? null : `${overview.farmers.length} ${t('nav.farmers').toLowerCase()}`,
    },
    {
      to: '/admin/suppliers',
      icon: StoreIcon,
      title: t('nav.suppliers'),
      description: t('admin.suppliersCardDesc'),
      count: loading ? null : `${overview.suppliers.length} ${t('nav.suppliers').toLowerCase()}`,
    },
    {
      to: '/admin/users',
      icon: UsersIcon,
      title: t('nav.users'),
      description: t('admin.usersCardDesc'),
      count: loading ? null : `${overview.users.length} ${t('nav.users').toLowerCase()}`,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow={t('admin.overview')}
        title={t('admin.dashboardTitle')}
        description={t('admin.overviewSubtitle')}
        actions={
          <Link
            to="/admin/farmers"
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
          >
            {t('admin.reviewAndVerify')}
            <ArrowRightIcon className="size-4" />
          </Link>
        }
      />

      {error && (
        <Notice variant="error" title={t('admin.couldNotLoadOverview')}>
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline underline-offset-2"
          >
            {t('admin.retry')}
          </button>
        </Notice>
      )}

      <section
        aria-label={t('admin.overview')}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label={t('admin.totalUsers')}
          value={value(overview.users.length)}
          icon={UsersIcon}
          tone="forest"
          description={t('admin.usersCardDesc')}
        />
        <StatCard
          label={t('admin.totalFarmers')}
          value={value(overview.farmers.length)}
          icon={SproutIcon}
          tone="mint"
          description={t('admin.farmersCardDesc')}
        />
        <StatCard
          label={t('admin.totalSuppliers')}
          value={value(overview.suppliers.length)}
          icon={StoreIcon}
          tone="stone"
          description={t('admin.suppliersCardDesc')}
        />
        <StatCard
          label={t('admin.pendingApprovals')}
          value={value(pendingFarmers + pendingSuppliers)}
          icon={ClockIcon}
          tone="gold"
          description={`${pendingFarmers} ${t('nav.farmers').toLowerCase()} · ${pendingSuppliers} ${t('nav.suppliers').toLowerCase()}`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section
          aria-labelledby="admin-quick-actions"
          className="rounded-2xl border border-forest/10 bg-white p-5 shadow-[0_4px_20px_rgba(22,95,48,0.04)] sm:p-6"
        >
          <h2
            id="admin-quick-actions"
            className="font-serif text-xl font-semibold text-forest-deeper"
          >
            {t('admin.quickActions')}
          </h2>
          <div className="mt-4 space-y-3">
            {quickLinks.map(({ to, icon: Icon, title, description, count }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-4 rounded-xl border border-forest/10 bg-[#f7faf6] p-4 transition-all hover:-translate-y-0.5 hover:border-forest/25 hover:bg-white hover:shadow-[0_8px_24px_rgba(22,95,48,0.08)]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint/60 text-forest-deeper">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-forest-deeper">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-stone">
                    {description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {count && (
                    <span className="hidden rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-dark ring-1 ring-forest/10 sm:inline">
                      {count}
                    </span>
                  )}
                  <ArrowRightIcon className="size-4 text-forest transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="admin-needs-attention"
          className="rounded-2xl border border-forest/10 bg-white p-5 shadow-[0_4px_20px_rgba(22,95,48,0.04)] sm:p-6"
        >
          <h2
            id="admin-needs-attention"
            className="font-serif text-xl font-semibold text-forest-deeper"
          >
            {t('admin.needsAttention')}
          </h2>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[0, 1].map((row) => (
                <div
                  key={row}
                  className="h-20 animate-pulse rounded-xl bg-mint/30"
                />
              ))}
            </div>
          ) : pendingFarmers + pendingSuppliers === 0 ? (
            <EmptyState
              icon={CheckCircleIcon}
              title={t('admin.allCaughtUp')}
              description={t('admin.allCaughtUpDesc')}
              className="mt-4 border-forest/15 px-4 py-8"
            />
          ) : (
            <div className="mt-4 space-y-3">
              {pendingFarmers > 0 && (
                <Link
                  to="/admin/farmers"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100/70"
                >
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      {pendingFarmers} · {t('admin.farmersAwaiting')}
                    </p>
                    <p className="mt-0.5 text-xs text-amber-800/80">
                      {t('admin.openReview')}
                    </p>
                  </div>
                  <ArrowRightIcon className="size-4 shrink-0 text-amber-800 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
              {pendingSuppliers > 0 && (
                <Link
                  to="/admin/suppliers"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-forest/15 bg-mint/25 p-4 transition-colors hover:bg-mint/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-forest-deeper">
                      {pendingSuppliers} · {t('admin.suppliersAwaiting')}
                    </p>
                    <p className="mt-0.5 text-xs text-stone">
                      {t('admin.openReview')}
                    </p>
                  </div>
                  <ArrowRightIcon className="size-4 shrink-0 text-forest transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          )}

          <div className="mt-5 border-t border-forest/10 pt-4">
            <p className="text-xs text-stone">
              {t('admin.activeAccounts')}:{' '}
              <span className="font-semibold text-forest-deeper">
                {value(activeAccounts)}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
