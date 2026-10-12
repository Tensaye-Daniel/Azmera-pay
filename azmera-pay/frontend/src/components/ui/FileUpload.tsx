import { useEffect, useMemo } from 'react'
import { useFieldContext } from './field-context'
import { DocumentIcon, TrashIcon, UploadIcon } from './icons'

interface FileUploadProps {
  file: File | null
  onChange: (file: File | null) => void
  accept?: string
  disabled?: boolean
  hint?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({
  file,
  onChange,
  accept = 'image/*,.pdf',
  disabled = false,
  hint = 'PNG, JPG or PDF. Up to a few MB.',
}: FileUploadProps) {
  const field = useFieldContext()
  const id = field?.id ?? 'file-upload'
  const invalid = Boolean(field?.invalid)

  const previewUrl = useMemo(
    () => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null),
    [file],
  )

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  if (file) {
    return (
      <div
        className={`flex items-center gap-3 rounded-xl border p-3 ${
          invalid ? 'border-red-400 bg-red-50/40' : 'border-forest/20 bg-white'
        }`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Preview of ${file.name}`}
            className="size-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-mint/40 text-forest-deeper">
            <DocumentIcon className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-dark">
            {file.name}
          </p>
          <p className="text-xs text-stone">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={`Remove ${file.name}`}
          disabled={disabled}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-stone transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-forest/40 ${
        invalid
          ? 'border-red-400 bg-red-50/40'
          : 'border-forest/25 bg-mint/10 hover:bg-mint/20'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span className="grid size-10 place-items-center rounded-full bg-forest/10 text-forest-deeper">
        <UploadIcon className="size-5" />
      </span>
      <span className="text-sm font-medium text-forest-deeper">
        Choose a file to upload
      </span>
      <span className="text-xs text-stone">{hint}</span>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="sr-only"
      />
    </label>
  )
}
