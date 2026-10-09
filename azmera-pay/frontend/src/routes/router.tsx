import { createBrowserRouter } from 'react-router-dom'
import LandingLayout from '../components/layout/LandingLayout'
import SupplierLayout from '../layouts/SupplierLayout'
import LandingPage from '../pages/public/LandingPage'
import NotFound from '../pages/public/NotFound'
import SupplierDashboard from '../pages/supplier/SupplierDashboard'
import SupplierListings from '../pages/supplier/SupplierListings'
import SupplierRequests from '../pages/supplier/SupplierRequests'
import SupplierMatches from '../pages/supplier/SupplierMatches'

const router = createBrowserRouter([
{
element: <LandingLayout />,
children: [
{ path: '/', element: <LandingPage /> },
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
