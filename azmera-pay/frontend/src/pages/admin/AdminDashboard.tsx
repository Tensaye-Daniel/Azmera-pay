import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const AdminDashboard = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t('admin.dashboardTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t('admin.verifyFarmersDesc')}
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/admin/farmers"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">{t('nav.farmers')}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {t('admin.reviewAndVerify')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t('admin.farmersCardDesc')}
          </p>
        </Link>
        <Link
          to="/admin/suppliers"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">{t('nav.suppliers')}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {t('admin.approveAndActivate')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t('admin.suppliersCardDesc')}
          </p>
        </Link>
        <Link
          to="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">{t('nav.users')}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {t('admin.accountsAndRoles')}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t('admin.usersCardDesc')}
          </p>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
