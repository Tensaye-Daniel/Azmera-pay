import { createBrowserRouter } from 'react-router-dom'
import LandingLayout from '../components/layout/LandingLayout'
import SupplierLayout from '../layouts/SupplierLayout'
import AgentLayout from '../layouts/AgentLayout'
import RequireAuth from './RequireAuth'
import LandingPage from '../pages/public/LandingPage'
import NotFound from '../pages/public/NotFound'
import SupplierDashboard from '../pages/supplier/SupplierDashboard'
import SupplierListings from '../pages/supplier/SupplierListings'
import SupplierRequests from '../pages/supplier/SupplierRequests'
import SupplierMatches from '../pages/supplier/SupplierMatches'
import AgentLogin from '../pages/auth/AgentLogin'
import AgentDashboard from '../pages/agent/AgentDashboard'
import FarmerListPage from '../pages/agent/FarmerListPage'
import FarmerCreatePage from '../pages/agent/FarmerCreatePage'
import FarmerDetailPage from '../pages/agent/FarmerDetailPage'
import FarmerEditPage from '../pages/agent/FarmerEditPage'

const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
    ],
  },
  {
    path: '/login',
    element: <AgentLogin />,
  },
  {
    path: '/agent',
    element: (
      <RequireAuth>
        <AgentLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AgentDashboard /> },
      { path: 'farmers', element: <FarmerListPage /> },
      { path: 'farmers/new', element: <FarmerCreatePage /> },
      { path: 'farmers/:id', element: <FarmerDetailPage /> },
      { path: 'farmers/:id/edit', element: <FarmerEditPage /> },
    ],
  },
  {
    path: '/supplier',
    element: <SupplierLayout />,
    children: [
      { index: true, element: <SupplierDashboard /> },
      { path: 'listings', element: <SupplierListings /> },
      { path: 'requests', element: <SupplierRequests /> },
      { path: 'matches', element: <SupplierMatches /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router