import { Link } from 'react-router-dom'
import { PhoneIcon } from '../../ui/icons'
import type { Farmer } from '../../../types/farmer'
import {
  FARMER_STATUS_CLASSES,
  FARMER_STATUS_LABELS,
} from '../../../utils/farmer'

interface FarmerListProps {
  farmers: Farmer[]
}

export default function FarmerList({ farmers }: FarmerListProps) {
  if (farmers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-forest/25 bg-white p-10 text-center">
        <p className="font-serif text-lg font-semibold text-forest-deeper">
          No farmers registered yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone">
          Register your first farmer to get started. Each farmer gets a unique
          Azmera account number they can use on USSD.
        </p>
        <Link
          to="/agent/farmers/new"
          className="mt-5 inline-block rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
        >
          Register a farmer
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-forest/10 bg-[#f7faf6] text-xs font-semibold uppercase tracking-wide text-stone">
            <tr>
              <th className="px-5 py-3.5">Farmer</th>
              <th className="px-5 py-3.5">Account number</th>
              <th className="px-5 py-3.5">Location</th>
              <th className="px-5 py-3.5">Crop</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/5">
            {farmers.map((farmer) => (
              <tr key={farmer.id} className="hover:bg-mint/20">
                <td className="px-5 py-4">
                  <p className="font-semibold text-forest-deeper">
                    {farmer.full_name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone">
                    <PhoneIcon className="size-3.5" />
                    {farmer.phone}
                  </p>
                </td>
                <td className="px-5 py-4 font-mono text-xs font-medium text-stone-dark">
                  {farmer.azmera_account_number}
                </td>
                <td className="px-5 py-4 text-stone">
                  {farmer.region}
                  {farmer.woreda ? ` · ${farmer.woreda}` : ''}
                </td>
                <td className="px-5 py-4 text-stone">{farmer.primary_crop}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      FARMER_STATUS_CLASSES[farmer.status] ??
                      'bg-[#f1eed8] text-[#756b32]'
                    }`}
                  >
                    {FARMER_STATUS_LABELS[farmer.status] ?? farmer.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/agent/farmers/${farmer.id}`}
                    className="text-sm font-semibold text-forest transition-colors hover:text-forest-dark"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}