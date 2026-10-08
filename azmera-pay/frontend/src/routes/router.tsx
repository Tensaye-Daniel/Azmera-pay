import { createBrowserRouter } from 'react-router-dom'
import LandingLayout from '../components/layout/LandingLayout'
import LandingPage from '../pages/public/LandingPage'
import NotFound from '../pages/public/NotFound'

const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default router
