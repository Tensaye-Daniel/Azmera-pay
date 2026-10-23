import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import RequireAuth from './RequireAuth'
import Login from '../pages/auth/Login'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminFarmers from '../pages/admin/AdminFarmers'
import AdminSuppliers from '../pages/admin/AdminSuppliers'
import AdminUsers from '../pages/admin/AdminUsers'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <RequireAuth allowedRoles={['admin']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'farmers', element: <AdminFarmers /> },
      { path: 'suppliers', element: <AdminSuppliers /> },
      { path: 'users', element: <AdminUsers /> },
    ],
  },
  { path: '*', element: <Navigate to='/' replace /> },
])

export default router
