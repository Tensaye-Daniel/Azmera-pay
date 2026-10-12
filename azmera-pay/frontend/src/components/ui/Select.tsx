import type { SelectHTMLAttributes } from 'react'
import { controlClasses } from './control'
import { useFieldContext } from './field-context'

export default function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const field = useFieldContext()
  const invalid = Boolean(field?.invalid)

  return (
    <div className="relative">
      <select
        {...props}
        id={field?.id ?? props.id}
        aria-invalid={invalid || undefined}
        aria-describedby={field?.describedBy ?? props['aria-describedby']}
        className={controlClasses(invalid, `appearance-none pr-10 ${className}`)}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-stone"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}
