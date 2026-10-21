import type { ComponentType, SVGProps } from 'react'

type StatTone = 'total' | 'active' | 'paused' | 'inactive'

const tones: Record<StatTone, { card: string; icon: string; value: string }> = {
  total: {
    card: 'border-[#d5e8d4] hover:border-[#b8d8b7]',
    icon: 'bg-[#edf6ec] text-forest',
    value: 'text-forest-deeper',
  },
  active: {
    card: 'border-[#cce7ce] hover:border-[#add8b2]',
    icon: 'bg-[#e9f5e9] text-[#318448]',
    value: 'text-[#286f3b]',
  },
  paused: {
    card: 'border-[#eee4bb] hover:border-[#dfd092]',
    icon: 'bg-[#f8f3df] text-[#947824]',
    value: 'text-[#806817]',
  },
  inactive: {
    card: 'border-[#ecdada] hover:border-[#dfc4c3]',
    icon: 'bg-[#f8eeee] text-[#a36563]',
    value: 'text-[#8f5553]',
  },
}

interface SupplierStatCardProps {
  title: string
  value: number | string
  description: string
  tone: StatTone
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export default function SupplierStatCard({
  title,
  value,
  description,
  tone,
  icon: Icon,
}: SupplierStatCardProps) {
  const style = tones[tone]

  return (
    <article
      className={`flex min-h-[158px] flex-col rounded-2xl border bg-white p-5 transition-colors hover:shadow-[0_4px_16px_rgba(22,95,48,0.05)] ${style.card}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${style.icon}`}
        >
          <Icon className="size-[18px]" />
        </span>
        <h2 className="text-sm font-medium text-stone-dark">{title}</h2>
      </div>
      <p className={`mt-4 text-3xl font-semibold tracking-tight ${style.value}`}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-stone">{description}</p>
    </article>
  )
}
