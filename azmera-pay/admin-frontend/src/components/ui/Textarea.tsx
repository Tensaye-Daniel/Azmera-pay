import type { TextareaHTMLAttributes } from 'react'
import { controlClasses } from './control'
import { useFieldContext } from './field-context'

export default function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useFieldContext()
  const invalid = Boolean(field?.invalid)

  return (
    <textarea
      {...props}
      id={field?.id ?? props.id}
      aria-invalid={invalid || undefined}
      aria-describedby={field?.describedBy ?? props['aria-describedby']}
      className={controlClasses(invalid, `min-h-24 resize-y ${className}`)}
    />
  )
}
