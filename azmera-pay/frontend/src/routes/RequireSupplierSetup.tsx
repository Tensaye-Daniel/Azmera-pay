import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { fetchSupplierProfile } from '../api/supplier'

interface RequireSupplierSetupProps {
  children: ReactNode
}

export default function RequireSupplierSetup({
  children,
}: RequireSupplierSetupProps) {
  const location = useLocation()
  const isSetupPage = location.pathname === '/supplier/shop-setup'
  const [check, setCheck] = useState<{
    pathname: string
    complete: boolean | null
    failed: boolean
  } | null>(null)
  const currentCheck =
    check?.pathname === location.pathname ? check : null

  useEffect(() => {
    if (isSetupPage) return

    let active = true
    fetchSupplierProfile()
      .then((profile) => {
        if (active) {
          setCheck({
            pathname: location.pathname,
            complete: Boolean(
              profile.region.trim() &&
                profile.woreda.trim() &&
                profile.product_categories.length > 0,
            ),
            failed: false,
          })
        }
      })
      .catch(() => {
        if (active) {
          setCheck({ pathname: location.pathname, complete: null, failed: true })
        }
      })

    return () => {
      active = false
    }
  }, [isSetupPage, location.pathname])

  if (isSetupPage) return children

  if (currentCheck?.failed) {
    return (
      <main className="mx-auto max-w-xl p-6" role="alert">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          We could not check your shop setup. Please refresh the page or try
          again shortly.
        </p>
      </main>
    )
  }

  if (currentCheck === null || currentCheck.complete === null) {
    return <div className="p-6 text-sm text-gray-600">Checking your shop setup...</div>
  }

  if (!currentCheck.complete) {
    return <Navigate to="/supplier/shop-setup" replace />
  }

  return children
}
