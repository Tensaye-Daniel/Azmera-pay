import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import type{ Role } from '../types/auth'
import Notice from '../components/ui/Notice'
interface RequireAuthProps {
  children: ReactNode
  allowedRoles?: Role[]
  requireApprovedSupplier?: boolean
}

export default function RequireAuth({ children, allowedRoles, requireApprovedSupplier = false, }: RequireAuthProps) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()

  if (!accessToken || !user) {
    const loginPath =
      allowedRoles && allowedRoles.length === 1 && allowedRoles[0] === 'supplier'
        ? '/login/supplier'
        : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }
   if (allowedRoles && !allowedRoles.includes(user.role)) {
    const homePath = user.role === 'supplier' ? '/supplier' : '/agent'
    return <Navigate to={homePath} replace />
  }
    if (
    requireApprovedSupplier &&
    (user.role !== 'supplier' ||
      user.supplier_approval_status !== 'approved')
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-forest/10 p-6 shadow-lg sm:p-8">
          <Notice variant={user.supplier_approval_status === 'pending' ? 'info' : 'error'} title={user.supplier_approval_status === 'pending' ? 'Supplier approval pending' : 'Supplier account not approved'}>
            {user.supplier_approval_status === 'pending'
              ? 'Your registration is awaiting admin approval. Supplier dashboard features will be available after approval.'
              : 'Your supplier account has not been approved. Please contact Azmera support for assistance.'}
          </Notice>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="button" onClick={logout} className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deeper">Sign out</button>
            <Link to="/" className="text-sm font-semibold text-forest underline">Return home</Link>
          </div>
        </section>
      </main>
    )
  }
  return children
}
