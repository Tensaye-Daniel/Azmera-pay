import type { ComponentType, SVGProps } from 'react'

export type StatTone = 'forest' | 'mint' | 'gold' | 'stone' | 'red'

const tones: Record<StatTone, { card: string; icon: string; value: string }> = {
  forest: {
    card: 'border-forest/15 hover:border-forest/30',
    icon: 'bg-forest/10 text-forest-deeper',
    value: 'text-forest-deeper',
  },
  mint: {
    card: 'border-[#cce7ce] hover:border-[#add8b2]',
    icon: 'bg-mint/50 text-forest-deeper',
    value: 'text-forest-deeper',
  },
  gold: {
    card: 'border-[#eee4bb] hover:border-[#dfd092]',
    icon: 'bg-[#f8f3df] text-[#806817]',
    value: 'text-[#806817]',
  },
  stone: {
    card: 'border-stone/15 hover:border-stone/30',
    icon: 'bg-stone/10 text-stone-dark',
    value: 'text-stone-dark',
  },
  red: {
    card: 'border-red-200 hover:border-red-300',
    icon: 'bg-red-50 text-red-700',
    value: 'text-red-700',
  },
}

interface StatCardProps {
  label: string
  value: number | string
  description?: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  tone?: StatTone
  className?: string
}

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'forest',
  className = '',
}: StatCardProps) {
  const style = tones[tone]

  return (
    <article
      className={`flex min-h-[150px] flex-col rounded-2xl border bg-white p-5 shadow-[0_4px_20px_rgba(22,95,48,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(22,95,48,0.08)] ${style.card} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-stone">{label}</p>
        {Icon && (
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${style.icon}`}
          >
            <Icon className="size-5" />
          </span>
        )}
      </div>
      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${style.value}`}
      >
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs leading-5 text-stone">{description}</p>
      )}
    </article>
  )
}
