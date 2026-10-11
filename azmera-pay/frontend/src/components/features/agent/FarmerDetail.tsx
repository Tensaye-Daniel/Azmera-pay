import { Link } from 'react-router-dom'
import {
  PhoneIcon,
  LocateIcon,
  CheckIcon,
} from '../../ui/icons'
import type { Farmer } from '../../../types/farmer'

const landOwnershipLabels: Record<Farmer['land_ownership'], string> = {
  owned: 'Owned',
  leased: 'Leased',
  communal: 'Communal',
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-stone-dark">{value}</dd>
    </div>
  )
}

export default function FarmerDetail({ farmer }: { farmer: Farmer }) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 bg-[#f7faf6] px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-mint/60 text-forest-deeper">
              <span className="text-lg font-semibold">
                {farmer.full_name
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </span>
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest-deeper">
                {farmer.full_name}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone">
                <PhoneIcon className="size-4" />
                {farmer.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                farmer.status === 'registered'
                  ? 'bg-mint/60 text-forest-deeper'
                  : 'bg-[#f1eed8] text-[#756b32]'
              }`}
            >
              <CheckIcon className="size-3.5" />
              {farmer.status}
            </span>
            <Link
              to={`/agent/farmers/${farmer.id}/edit`}
              className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-deeper"
            >
              Edit
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-1 divide-y divide-forest/5 px-6 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0 sm:py-2">
          <div className="sm:border-r sm:border-forest/5 sm:pr-8">
            <DetailRow
              label="Azmera account number"
              value={farmer.azmera_account_number}
            />
            <DetailRow
              label="Fayda FIN"
              value={farmer.fayda_fin ?? 'Not provided'}
            />
            <DetailRow
              label="Primary crop"
              value={farmer.primary_crop}
            />
            <DetailRow
              label="Farm size"
              value={`${farmer.farm_size_hectares} ha`}
            />
          </div>
          <div className="sm:pl-8">
            <DetailRow label="Region" value={farmer.region} />
            <DetailRow
              label="Woreda"
              value={farmer.woreda}
            />
            <DetailRow
              label="Kebele"
              value={farmer.kebele || 'Not provided'}
            />
            <DetailRow
              label="Land ownership"
              value={
                landOwnershipLabels[farmer.land_ownership] ??
                farmer.land_ownership
              }
            />
          </div>
        </dl>
      </section>

      {(farmer.land_ownership_notes || farmer.notes) && (
        <section className="rounded-2xl border border-forest/10 bg-white p-6 shadow-[0_4px_20px_rgba(22,95,48,0.04)]">
          <h3 className="mb-3 font-serif text-lg font-semibold text-forest-deeper">
            Notes
          </h3>
          {farmer.land_ownership_notes && (
            <p className="text-sm leading-6 text-stone">
              <span className="font-semibold text-stone-dark">
                Land ownership:
              </span>{' '}
              {farmer.land_ownership_notes}
            </p>
          )}
          {farmer.notes && (
            <p className="mt-2 text-sm leading-6 text-stone">
              <span className="font-semibold text-stone-dark">
                General:
              </span>{' '}
              {farmer.notes}
            </p>
          )}
        </section>
      )}

      <p className="flex items-center gap-2 text-xs text-stone">
        <LocateIcon className="size-4" />
        Registered to your workspace account
      </p>
    </div>
  )
}