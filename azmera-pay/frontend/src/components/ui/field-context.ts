import { createContext, useContext } from 'react'

export interface FieldContextValue {
  id: string
  errorId: string
  hintId: string
  invalid: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

export function useFieldContext() {
  return useContext(FieldContext)
}
