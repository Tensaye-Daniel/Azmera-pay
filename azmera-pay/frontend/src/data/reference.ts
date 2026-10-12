// Canonical Ethiopian regions - mirrors backend core/matching/constants.py.
export const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Central Ethiopia',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'South Ethiopia',
  'South West Ethiopia',
  'Tigray',
] as const

export const LAND_OWNERSHIP_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'leased', label: 'Leased' },
  { value: 'communal', label: 'Communal' },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const

// Identity document types accepted for agent verification.
export const ID_TYPE_OPTIONS = [
  { value: 'national_id', label: 'National ID (Fayda)' },
  { value: 'kebele_id', label: 'Kebele ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: 'Driver License' },
] as const