import type { ListingStatus } from '../../../api/supplier'

const labels: Record<ListingStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  inactive: 'Inactive',
  expired: 'Inactive',
}

const styles: Record<ListingStatus, string> = {
  active: 'border-[#cce7ce] bg-[#eff7ef] text-[#286f3b]',
  paused: 'border-[#eee4bb] bg-[#faf6e8] text-[#806817]',
  inactive: 'border-[#ecdada] bg-[#f8eeee] text-[#8f5553]',
  expired: 'border-[#ecdada] bg-[#f8eeee] text-[#8f5553]',
}

export default function SupplierListingStatusBadge({
  status,
}: {
  status: ListingStatus
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
