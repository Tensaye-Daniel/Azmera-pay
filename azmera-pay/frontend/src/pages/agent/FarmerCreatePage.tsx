import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FarmerRegistrationWizard from '../../components/features/agent/FarmerRegistrationWizard'
import { CheckIcon } from '../../components/ui/icons'
import type { Farmer } from '../../types/farmer'

export default function FarmerCreatePage() {
  const navigate = useNavigate()
  const [registered, setRegistered] = useState<Farmer | null>(null)
  const [copied, setCopied] = useState(false)

  const copyAccountNumber = async () => {
    if (!registered) return
    try {
      await navigator.clipboard.writeText(registered.azmera_account_number)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (registered) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-forest/10 bg-white p-6 text-center shadow-[0_4px_20px_rgba(22,95,48,0.04)] sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-mint/60 text-forest-deeper">
            <CheckIcon className="size-7" />
          </span>

          <h1 className="mt-5 font-serif text-2xl font-semibold text-forest-deeper">
            Farmer registered
          </h1>
          <p className="mt-1 text-sm text-stone">
            {registered.full_name} has been submitted for verification.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-forest/15 bg-[#f7faf6] px-5 py-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone">
              Azmera account number
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-forest-deeper">
              {registered.azmera_account_number}
            </p>
            <p className="mt-2 text-xs leading-5 text-stone">
              Share this number with the farmer — they will use it to order
              inputs over USSD.
            </p>

            <button
              type="button"
              onClick={copyAccountNumber}
              className="mt-4 rounded-xl border border-forest/20 px-4 py-2 text-sm font-semibold text-forest-deeper transition-colors hover:bg-mint/30"
            >
              {copied ? 'Copied!' : 'Copy number'}
            </button>
          </div>

          <dl className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-stone">Phone</dt>
              <dd className="font-medium text-stone-dark">{registered.phone}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-stone">Status</dt>
              <dd className="font-medium text-[#8a6d1b]">Pending verification</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/agent/farmers/${registered.id}`)}
              className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
            >
              View farmer details
            </button>
            <button
              type="button"
              onClick={() => setRegistered(null)}
              className="rounded-xl border border-forest/20 px-5 py-2.5 text-sm font-semibold text-forest-deeper transition-colors hover:bg-mint/30"
            >
              Register another farmer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-forest-deeper">
          Register a farmer
        </h1>
        <p className="mt-1 text-sm text-stone">
          Complete the four steps to submit the farmer for verification. The
          farmer gets an Azmera account number to order inputs over USSD.
        </p>
      </div>

      <FarmerRegistrationWizard onSuccess={setRegistered} />
    </div>
  )
}
