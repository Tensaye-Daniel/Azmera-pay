import type { InputHTMLAttributes, ReactNode } from 'react'
import { controlClasses } from './control'
import { useFieldContext } from './field-context'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode
  trailing?: ReactNode
}

export default function TextInput({
  className = '',
  leadingIcon,
  trailing,
  ...props
}: TextInputProps) {
  const field = useFieldContext()
  const invalid = Boolean(field?.invalid)

  const control = (
    <input
      {...props}
      id={field?.id ?? props.id}
      aria-invalid={invalid || undefined}
      aria-describedby={field?.describedBy ?? props['aria-describedby']}
      className={controlClasses(
        invalid,
        `${leadingIcon ? 'pl-11' : ''} ${trailing ? 'pr-11' : ''} ${className}`,
      )}
    />
  )

  if (!leadingIcon && !trailing) return control

  return (
    <div className="relative">
      {leadingIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone">
          {leadingIcon}
        </span>
      )}
      {control}
      {trailing && (
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
          {trailing}
        </span>
      )}
    </div>
  )
}
