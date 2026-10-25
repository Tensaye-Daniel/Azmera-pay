import type { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps): IconProps => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
})

export function SproutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 22V11" />
      <path d="M12 11c0-5-3.6-7-8-6 0 4.4 3.2 7 8 6Z" />
      <path d="M12 11c0-6 4.5-7.5 8-6.5 0 4.8-3 8-8 6.5Z" />
      <path d="M12 14c0-4.5 3-7 7-6.5" opacity="0.5" />
    </svg>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 4C11 4.5 4.5 8.5 4.5 16c0 1.7.5 3.2 1.2 4.3C10 20 14.5 19.5 20 4Z" />
      <path d="M5.7 20.3C10 14 15.5 9.5 20 4" />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M3.5 19.5c.6-3.4 2.8-5.3 5.5-5.3s4.9 1.9 5.5 5.3" />
      <path d="M16 5.2c1.8.4 3 1.7 3 3.6 0 1.9-1.2 3.2-3 3.6" />
      <path d="M17.6 14.3c1.9.4 3.2 1.9 3.7 4.6" />
    </svg>
  )
}

export function NetworkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5" r="2.4" />
      <circle cx="5" cy="18" r="2.4" />
      <circle cx="19" cy="18" r="2.4" />
      <path d="M12 7.4 6.4 15.6" />
      <path d="M12 7.4l5.6 8.2" />
      <path d="M7.4 18h9.2" />
    </svg>
  )
}

export function TrendingIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l8 3v6c0 5-3.3 8.3-8 9-4.7-.7-8-4-8-9V6Z" />
      <path d="m9 11.5 2.2 2.2 4.5-4.6" />
    </svg>
  )
}

export function TagIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4h7l9 9-7 7-9-9Z" />
      <circle cx="8.4" cy="8.4" r="1.5" />
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20.5C6.2 16.2 3 12.8 3 9a4.5 4.5 0 0 1 9-1.4A4.5 4.5 0 0 1 21 9c0 3.8-3.2 7.2-9 11.5Z" />
    </svg>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M12 3c2.7 2.5 4 5.5 4 9s-1.3 6.5-4 9" />
    </svg>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.6 12S6.2 5.6 12 5.6 21.4 12 21.4 12 17.8 18.4 12 18.4 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="3.1" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.2 4.2L19 6.5" />
    </svg>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function LocateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.8v3M12 18.2v3M21.2 12h-3M5.8 12h-3M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1M18.5 18.5l-2.1-2.1M7.6 7.6 5.5 5.5" />
    </svg>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 17.5h2" />
    </svg>
  )
}

export function StoreIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16l1.6 4H2.4Z" />
      <path d="M4 10h16v10H4z" />
      <path d="M8 20v-5h8v5" />
    </svg>
  )
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3H9v9h3v-9h2.5l.5-3h-3V6.5c0-.6.4-1 1-1H15Z" />
    </svg>
  )
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 4 16 16M20 4 4 20" />
    </svg>
  )
}

export function TelegramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m21.5 4-2.9 16-7.9-5.1" />
      <path d="M21.5 4 10.7 14.9" />
      <path d="M10.7 14.9 3.5 12.4" />
    </svg>
  )
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8v11" />
      <path d="M4 4.9v.2" />
      <path d="M8.5 19v-7" />
      <path d="M8.5 12a3.5 3.5 0 0 1 6.9-1.1V19" />
    </svg>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3M16 3v3" />
    </svg>
  )
}

export function IdCardIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <circle cx="8.5" cy="11" r="2.2" />
      <path d="M4.8 16c.5-1.7 2-2.7 3.7-2.7s3.2 1 3.7 2.7" />
      <path d="M14.5 10h4M14.5 13h4" />
    </svg>
  )
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 15.5V4.5" />
      <path d="m7.5 9 4.5-4.5L16.5 9" />
      <path d="M4.5 14.5v3A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </svg>
  )
}

export function DocumentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13 3v5h5" />
      <path d="M8.5 13h7M8.5 16.5h5" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.5v2.5" />
    </svg>
  )
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A9.7 9.7 0 0 1 12 6.1c5.8 0 9.4 5.9 9.4 5.9a15 15 0 0 1-2.7 3.4" />
      <path d="M6.6 6.9A15.3 15.3 0 0 0 2.6 12s3.6 6.4 9.4 6.4a9.4 9.4 0 0 0 3.5-.7" />
      <path d="M9.9 9.9a3.1 3.1 0 0 0 4.4 4.4" />
    </svg>
  )
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3 13h18" />
      <path d="M11 13v1.5h2V13" />
    </svg>
  )
}

export function HashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 3.5 7.5 20.5M16.5 3.5 15 20.5" />
      <path d="M4.5 8.5h15M4 15.5h15" />
    </svg>
  )
}

export function UserPlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9.5" cy="8" r="3.6" />
      <path d="M3.5 20c.6-3.5 3-5.5 6-5.5s5.4 2 6 5.5" />
      <path d="M19 6v6M16 9h6" />
    </svg>
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.6 2.6L16 9.5" />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.6 21 19.4a1 1 0 0 1-.9 1.6H3.9a1 1 0 0 1-.9-1.6Z" />
      <path d="M12 9.5v4M12 17h.01" />
    </svg>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H4" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5h16" />
      <path d="M9 6.5V4.8A1.3 1.3 0 0 1 10.3 3.5h3.4A1.3 1.3 0 0 1 15 4.8v1.7" />
      <path d="M6 6.5 6.8 20a1.3 1.3 0 0 0 1.3 1.2h7.8A1.3 1.3 0 0 0 17.2 20L18 6.5" />
      <path d="M10 10.5v7M14 10.5v7" />
    </svg>
  )
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg {...base(props)} className={`animate-spin ${props.className ?? ''}`}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}

export function FaydaIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12a7.5 7.5 0 0 1 15 0v1.6" />
      <path d="M7.6 12.2a4.4 4.4 0 0 1 8.8 0v2.6" />
      <path d="M10.6 12.4a1.4 1.4 0 0 1 2.8 0V16a1 1 0 0 0 1 1" />
      <path d="M4.9 15.1A7.5 7.5 0 0 0 7.1 19.3" />
      <path d="M12 19.5a7.6 7.6 0 0 0 3.5-.85" />
      <path d="M10 18.7A4.4 4.4 0 0 1 9.1 16" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m3.5 10.5 8.5-7 8.5 7" />
      <path d="M5.5 9.2V20a1 1 0 0 0 1 1h4v-6h3v6h4a1 1 0 0 0 1-1V9.2" />
    </svg>
  )
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M15 4h2.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H15" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h10" />
    </svg>
  )
}