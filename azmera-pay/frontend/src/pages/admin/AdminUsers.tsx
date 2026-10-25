import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  listAdminUsers,
  updateAdminUser,
  type AdminUser,
  type SupplierApprovalStatus,
  type UserRole,
} from '../../api/admin'

const roleStyles: Record<UserRole, string> = {
  admin: 'bg-purple-50 text-purple-700',
  agent: 'bg-blue-50 text-blue-700',
  supplier: 'bg-emerald-50 text-emerald-700',
  farmer: 'bg-amber-50 text-amber-700',
  buyer: 'bg-slate-100 text-slate-700',
}

const approvalStyles: Record<SupplierApprovalStatus, string> = {
  not_required: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
}

const AdminUsers = () => {
  const { t } = useTranslation()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole | 'all'>('all')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [query, setQuery] = useState({
    search: '',
    role: 'all' as UserRole | 'all',
    status: 'all' as 'all' | 'active' | 'inactive',
  })
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const params: Record<string, string> = {}
    if (query.role !== 'all') params.role = query.role
    if (query.status !== 'all') params.status = query.status
    if (query.search.trim()) params.search = query.search.trim()
    listAdminUsers(params)
      .then((data) => {
        if (!cancelled) {
          setUsers(data)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load users')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  const applyFilters = () => {
    setLoading(true)
    setQuery({ search, role, status })
  }

  const filtered = useMemo(() => users, [users])

  const toggleActive = async (user: AdminUser) => {
    setBusyId(user.id)
    try {
      const updated = await updateAdminUser(user.id, {
        is_active: !user.is_active,
      })
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? updated : item)),
      )
    } catch {
      setError('Action failed')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t('nav.users')}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('admin.usersDesc')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('admin.searchUserPlaceholder')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-64"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole | 'all')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">{t('admin.allRoles')}</option>
            <option value="admin">Admin</option>
            <option value="agent">{t('agent.agent')}</option>
            <option value="supplier">{t('nav.suppliers')}</option>
            <option value="farmer">{t('nav.farmers')}</option>
            <option value="buyer">Buyer</option>
          </select>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as 'all' | 'active' | 'inactive')
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">{t('admin.allAccounts')}</option>
            <option value="active">{t('admin.activeStatus')}</option>
            <option value="inactive">{t('admin.inactiveStatus')}</option>
          </select>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            {t('admin.apply')}
          </button>
        </div>
      </header>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  {t('admin.userCol')}
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  {t('admin.roleCol')}
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  {t('admin.supplierApprovalCol')}
                </th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">
                  {t('admin.statusCol')}
                </th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">
                  {t('admin.actionsCol')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-500" colSpan={5}>
                    {t('common.loading')}
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-500" colSpan={5}>
                    {t('admin.noUsersFound')}
                  </td>
                </tr>
              )}
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-slate-500">{user.phone}</p>
                    {user.email && (
                      <p className="text-slate-500">{user.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[user.role]}`}
                    >
                      {user.role}
                    </span>
                    {user.is_staff && (
                      <p className="mt-1 text-xs text-slate-500">{t('admin.staffBadge')}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${approvalStyles[user.supplier_approval_status]}`}
                    >
                      {user.supplier_approval_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">
                      {user.is_active ? t('admin.activeStatus') : t('admin.inactiveStatus')}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => void toggleActive(user)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      {user.is_active ? t('admin.deactivate') : t('admin.activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
