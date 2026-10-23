import type { ReactNode } from 'react'
import { AlertIcon, CheckCircleIcon, ShieldIcon } from './icons'

type NoticeVariant = 'info' | 'success' | 'error'

interface NoticeProps {
  variant?: NoticeVariant
  title?: string
  children: ReactNode
  className?: string
}

const styles: Record<NoticeVariant, string> = {
  info: 'border-forest/15 bg-mint/25 text-stone-dark',
  success: 'border-forest/25 bg-forest/10 text-forest-deeper',
  error: 'border-red-200 bg-red-50 text-red-700',
}

const icons: Record<NoticeVariant, ReactNode> = {
  info: <ShieldIcon className="size-4" />,
  success: <CheckCircleIcon className="size-4" />,
  error: <AlertIcon className="size-4" />,
}

export default function Notice({
  variant = 'info',
  title,
  children,
  className = '',
}: NoticeProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border px-4 py-3 text-xs leading-5 ${styles[variant]} ${className}`}
    >
      <span className="mt-0.5 shrink-0">{icons[variant]}</span>
      <div className="min-w-0">
        {title && <p className="mb-0.5 text-sm font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
