import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { SpinnerIcon } from './icons'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-deeper',
  secondary: 'border border-forest/20 text-forest-deeper hover:bg-mint/30',
  ghost: 'text-forest-deeper hover:bg-forest/10',
}

export default function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        variants[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <SpinnerIcon className="size-4" /> : icon}
      {children}
    </button>
  )
}
