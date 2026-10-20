import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingLayout from '../components/layout/LandingLayout'
import SupplierLayout from '../layouts/SupplierLayout'
import AgentLayout from '../layouts/AgentLayout'
import RequireAuth from './RequireAuth'
import RequireSupplierSetup from './RequireSupplierSetup'
import LandingPage from '../pages/public/LandingPage'
import NotFound from '../pages/public/NotFound'
import SupplierDashboard from '../pages/supplier/SupplierDashboard'
import SupplierListings from '../pages/supplier/SupplierListings'
import SupplierRequests from '../pages/supplier/SupplierRequests'
import SupplierMatches from '../pages/supplier/SupplierMatches'
import SupplierShopSetup from '../pages/supplier/SupplierShopSetup'
import Login from '../pages/auth/Login'
import AgentSignup from '../pages/auth/AgentSignup'
import AgentDashboard from '../pages/agent/AgentDashboard'
import FarmerListPage from '../pages/agent/FarmerListPage'
import FarmerCreatePage from '../pages/agent/FarmerCreatePage'
import FarmerDetailPage from '../pages/agent/FarmerDetailPage'
import FarmerEditPage from '../pages/agent/FarmerEditPage'
import AgentSettings from '../pages/agent/AgentSettings'
import SupplierSignup from '../pages/auth/SupplierSignup'

const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
    ],
  },
  { path: '/login', element: <Login variant="agent" /> },
  { path: '/login/supplier', element: <Login variant="supplier" /> },
  { path: '/register', element: <Navigate to="/register/agent" replace /> },
  { path: '/register/agent', element: <AgentSignup /> },
  { path: '/register/supplier', element: <SupplierSignup /> },
  {
    path: '/agent',
    element: (
      <RequireAuth allowedRoles={['agent']}>
        <AgentLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AgentDashboard /> },
      { path: 'settings', element: <AgentSettings /> },
      { path: 'farmers', element: <FarmerListPage /> },
      { path: 'farmers/new', element: <FarmerCreatePage /> },
      { path: 'farmers/:id', element: <FarmerDetailPage /> },
      { path: 'farmers/:id/edit', element: <FarmerEditPage /> },
    ],
  },
  {
    path: '/supplier',
    element: (
      <RequireAuth
        allowedRoles={['supplier']}
        requireApprovedSupplier
      >
        <RequireSupplierSetup>
          <SupplierLayout />
        </RequireSupplierSetup>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <SupplierDashboard /> },
      { path: 'listings', element: <SupplierListings /> },
      { path: 'requests', element: <SupplierRequests /> },
      { path: 'matches', element: <SupplierMatches /> },
      { path: 'shop-setup', element: <SupplierShopSetup /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export default router
