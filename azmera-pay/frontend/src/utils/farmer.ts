import type { FarmerStatus } from '../types/farmer'

export const FARMER_STATUS_LABELS: Record<FarmerStatus, string> = {
  registered: 'Registered',
  pending: 'Pending verification',
  unverified: 'Unverified',
}

export const FARMER_STATUS_CLASSES: Record<FarmerStatus, string> = {
  registered: 'bg-mint/60 text-forest-deeper',
  pending: 'bg-[#fdf2d4] text-[#8a6d1b]',
  unverified: 'bg-stone/10 text-stone-dark',
}

export const FARMER_STATUS_DOTS: Record<FarmerStatus, string> = {
  registered: 'bg-forest-dark',
  pending: 'bg-[#b58900]',
  unverified: 'bg-stone',
}

export const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
