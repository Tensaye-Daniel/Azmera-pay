import type { ComponentType, ReactNode, SVGProps } from 'react'

interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-forest/25 bg-white px-6 py-12 text-center ${className}`}
    >
      {Icon && (
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint/50 text-forest-deeper">
          <Icon className="size-7" />
        </span>
      )}
      <h3 className="mt-5 font-serif text-lg font-semibold text-forest-deeper">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      )}
    </div>
  )
}
