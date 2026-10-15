import type { FarmerStatus } from '../../../types/farmer'
import {
  FARMER_STATUS_CLASSES,
  FARMER_STATUS_DOTS,
  FARMER_STATUS_LABELS,
} from '../../../utils/farmer'

interface StatusBadgeProps {
  status: FarmerStatus
  className?: string
}

export default function StatusBadge({
  status,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        FARMER_STATUS_CLASSES[status] ?? 'bg-stone/10 text-stone-dark'
      } ${className}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${
          FARMER_STATUS_DOTS[status] ?? 'bg-stone'
        }`}
        aria-hidden="true"
      />
      {FARMER_STATUS_LABELS[status] ?? status}
    </span>
  )
}
