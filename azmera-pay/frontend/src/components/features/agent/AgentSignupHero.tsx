import type { ComponentType } from 'react'
import {
  LeafIcon,
  NetworkIcon,
  SproutIcon,
  UserPlusIcon,
  type IconProps,
} from '../../ui/icons'

const BENEFITS: {
  icon: ComponentType<IconProps>
  title: string
  description: string
}[] = [
  {
    icon: UserPlusIcon,
    title: 'Register and verify farmers',
    description: 'Onboard farmers with trusted, reviewable records.',
  },
  {
    icon: NetworkIcon,
    title: 'Connect farmers to opportunities',
    description: 'Link produce to buyers, suppliers and better prices.',
  },
  {
    icon: SproutIcon,
    title: 'Strengthen Ethiopian agriculture',
    description: 'Grow a resilient, transparent farming network.',
  },
]

export default function AgentSignupHero() {
  return (
    <section className="flex h-full flex-col gap-8">
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-xl bg-forest text-white shadow-sm">
          <LeafIcon className="size-6" />
        </span>
        <span className="font-serif text-2xl font-semibold text-forest-deeper">
          Azmera
        </span>
      </div>

      <div className="space-y-4">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-forest-deeper sm:text-4xl">
          Empowering Agriculture, Together.
        </h1>
        <p className="max-w-md text-sm leading-6 text-stone">
          Join Azmera as a field agent and help connect Ethiopian farmers with
          better agricultural opportunities.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_18px_50px_rgba(22,95,48,0.12)]">
        <img
          src="/images/agentPic.jpg"
          alt="Azmera field agent working alongside farmers"
          className="aspect-[4/3] w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deeper/35 to-transparent"
          aria-hidden="true"
        />
        <p className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-forest-deeper backdrop-blur">
          Field agents on the ground
        </p>
      </div>

      <ul className="mt-auto space-y-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest/10 text-forest-deeper">
              <benefit.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-dark">
                {benefit.title}
              </p>
              <p className="text-xs leading-5 text-stone">
                {benefit.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
