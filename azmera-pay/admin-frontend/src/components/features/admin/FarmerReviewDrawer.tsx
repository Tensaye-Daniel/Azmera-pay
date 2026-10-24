import { useEffect, useState } from 'react'
import {
  activateFarmer,
  deactivateFarmer,
  downloadFarmerDocument,
  markFarmerPending,
  unverifyFarmer,
  verifyFarmer,
  type AdminFarmer,
  type AdminFarmerDocument,
  type FarmerStatus,
} from '../../../api/admin'
import { CloseIcon, DocumentIcon } from '../../ui/icons'

const statusStyles: Record<FarmerStatus, string> = {
  registered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  unverified: 'bg-slate-100 text-slate-700 ring-slate-200',
}

const statusLabels: Record<FarmerStatus, string> = {
  registered: 'Verified',
  pending: 'Pending review',
  unverified: 'Unverified',
}

const landOwnershipLabels: Record<string, string> = {
  owned: 'Owned',
  leased: 'Leased',
  communal: 'Communal',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function DocumentRow({
  farmerId,
  doc,
}: {
  farmerId: string
  doc: AdminFarmerDocument
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isImage = doc.content_type.startsWith('image/')

  useEffect(() => {
    if (!isImage) return
    let cancelled = false
    let objectUrl: string | null = null
    downloadFarmerDocument(farmerId, doc.id)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setError('Preview unavailable')
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [doc.id, farmerId, isImage])

  const fetchUrl = async () => {
    const blob = await downloadFarmerDocument(farmerId, doc.id)
    return URL.createObjectURL(blob)
  }

  const openDocument = async () => {
    setBusy(true)
    setError(null)
    try {
      const url = await fetchUrl()
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setError('Could not open document')
    } finally {
      setBusy(false)
    }
  }

  const saveDocument = async () => {
    setBusy(true)
    setError(null)
    try {
      const url = await fetchUrl()
      const link = window.document.createElement('a')
      link.href = url
      link.download = doc.original_filename
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setError('Could not download document')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-start gap-3">
        {isImage && previewUrl ? (
          <button
            type="button"
            onClick={() => void openDocument()}
            className="size-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
            aria-label={`Preview ${doc.original_filename}`}
          >
            <img
              src={previewUrl}
              alt={doc.original_filename}
              className="size-full object-cover"
            />
          </button>
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400">
            <DocumentIcon className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">
            {doc.document_type_display}
          </p>
          <p className="truncate text-xs text-slate-500">
            {doc.original_filename} · {formatBytes(doc.size_bytes)}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-700">
            Encrypted at rest
          </p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void openDocument()}
          className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
        >
          View
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveDocument()}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white disabled:opacity-50"
        >
          Download
        </button>
      </div>
    </div>
  )
}

interface FarmerReviewDrawerProps {
  farmer: AdminFarmer
  onClose: () => void
  onUpdated: (farmer: AdminFarmer) => void
}

export default function FarmerReviewDrawer({
  farmer,
  onClose,
  onUpdated,
}: FarmerReviewDrawerProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const previousOverflow = window.document.body.style.overflow
    window.document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const runAction = async (
    label: string,
    action: (id: string) => Promise<AdminFarmer>,
  ) => {
    setBusy(label)
    setError(null)
    try {
      const updated = await action(farmer.id)
      onUpdated(updated)
    } catch {
      setError('Action failed. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const documents = farmer.documents ?? []

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close farmer review"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="farmer-review-title"
        className="relative flex h-full w-full max-w-xl flex-col bg-slate-50 shadow-2xl"
      >
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                {getInitials(farmer.full_name)}
              </span>
              <div>
                <h2
                  id="farmer-review-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {farmer.full_name}
                </h2>
                <p className="text-xs text-slate-500">
                  {farmer.phone} · {farmer.azmera_account_number}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[farmer.status]}`}
            >
              {statusLabels[farmer.status]}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                farmer.is_active
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : 'bg-slate-100 text-slate-600 ring-slate-200'
              }`}
            >
              {farmer.is_active ? 'Account active' : 'Account inactive'}
            </span>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Section title="Identity">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Full name" value={farmer.full_name} />
              <DetailRow label="Phone" value={farmer.phone} />
              <DetailRow label="Email" value={farmer.email || 'Not provided'} />
              <DetailRow
                label="Gender"
                value={
                  farmer.gender
                    ? farmer.gender.charAt(0).toUpperCase() +
                      farmer.gender.slice(1)
                    : 'Not provided'
                }
              />
              <DetailRow
                label="Fayda FIN"
                value={farmer.fayda_fin || 'Not provided'}
              />
              <DetailRow
                label="Azmera account"
                value={farmer.azmera_account_number}
              />
            </dl>
          </Section>

          <Section title="Farm information">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Region" value={farmer.region} />
              <DetailRow label="Woreda" value={farmer.woreda} />
              <DetailRow
                label="Kebele"
                value={farmer.kebele || 'Not provided'}
              />
              <DetailRow label="Primary crop" value={farmer.primary_crop} />
              <DetailRow
                label="Farm size"
                value={`${farmer.farm_size_hectares} ha`}
              />
              <DetailRow
                label="Land ownership"
                value={
                  landOwnershipLabels[farmer.land_ownership] ??
                  farmer.land_ownership
                }
              />
            </dl>
            {farmer.land_ownership_notes && (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {farmer.land_ownership_notes}
              </p>
            )}
          </Section>

          <Section
            title="Supporting documents"
            description="Encrypted at rest and decrypted only for this review."
          >
            {documents.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                No documents were attached during registration.
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    farmerId={farmer.id}
                    doc={doc}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section
            title="Registration & notes"
            description="Where this farmer came from and anything the agent captured."
          >
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow
                label="Registered by"
                value={farmer.registered_by_name || 'Unknown agent'}
              />
              <DetailRow
                label="Agent phone"
                value={farmer.registered_by_phone || 'Not available'}
              />
              <DetailRow
                label="Registered at"
                value={formatDate(farmer.created_at)}
              />
              <DetailRow
                label="Last updated"
                value={formatDate(farmer.updated_at)}
              />
            </dl>
            {farmer.notes && (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {farmer.notes}
              </p>
            )}
          </Section>
        </div>

        <footer className="border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {farmer.status !== 'pending' && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  void runAction('pending', markFarmerPending)
                }
                className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
              >
                {busy === 'pending' ? 'Saving…' : 'Mark pending'}
              </button>
            )}
            {farmer.status !== 'unverified' && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void runAction('unverify', unverifyFarmer)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {busy === 'unverify' ? 'Saving…' : 'Unverify'}
              </button>
            )}
            {farmer.is_active ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void runAction('deactivate', deactivateFarmer)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                {busy === 'deactivate' ? 'Saving…' : 'Deactivate'}
              </button>
            ) : (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void runAction('activate', activateFarmer)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {busy === 'activate' ? 'Saving…' : 'Activate'}
              </button>
            )}
            {farmer.status !== 'registered' && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void runAction('verify', verifyFarmer)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy === 'verify' ? 'Approving…' : 'Approve farmer'}
              </button>
            )}
          </div>
        </footer>
      </aside>
    </div>
  )
}
