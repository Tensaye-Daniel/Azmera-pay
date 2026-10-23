import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import type { Role } from '../types/auth'

interface RequireAuthProps {
  children: any
  allowedRoles?: Role[]
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!accessToken || !user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to='/login' replace />
  }
  return <>{children}</>
}
