import { createBrowserRouter } from 'react-router-dom'
import LandingLayout from '../components/layout/LandingLayout'
import SupplierLayout from '../layouts/SupplierLayout'
import LandingPage from '../pages/public/LandingPage'
import NotFound from '../pages/public/NotFound'
import SupplierDashboard from '../pages/supplier/SupplierDashboard'

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
],
},
{
path: '*',
element: <NotFound />,
},
])

export default router
