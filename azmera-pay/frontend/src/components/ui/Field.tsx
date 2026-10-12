import type { ReactNode } from 'react'
import { FieldContext } from './field-context'

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export default function Field({
  id,
  label,
  hint,
  error,
  required = false,
  className = '',
  children,
}: FieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <FieldContext.Provider
      value={{ id, errorId, hintId, invalid: Boolean(error) }}
    >
      <div className={className}>
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-stone-dark"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {children}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs leading-5 text-red-600"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-xs leading-5 text-stone">
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  )
}
