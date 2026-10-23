import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

interface LegalDialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export default function LegalDialog({
  open,
  title,
  onClose,
  children,
}: LegalDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    dialogRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-stone-dark/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative z-10 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl focus:outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-forest-deeper">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-stone transition-colors hover:bg-forest/10 hover:text-forest-deeper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm leading-6 text-stone">{children}</div>
      </div>
    </div>
  )
}
