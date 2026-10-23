import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Verify farmers and suppliers before they can participate fully.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/farmers"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">Farmers</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Review & verify
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Approve registrations and manage status
          </p>
        </Link>
        <Link
          to="/suppliers"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">Suppliers</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Approve & activate
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Review shop setup and grant access
          </p>
        </Link>
        <Link
          to="/users"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-slate-500">Users</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            Accounts & roles
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Toggle access and manage roles
          </p>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard

