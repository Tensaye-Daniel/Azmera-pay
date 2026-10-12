import type { ComponentType } from 'react'
import {
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
    <section className="relative flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-white/50 shadow-[0_18px_50px_rgba(22,95,48,0.18)] lg:min-h-[640px]">
      <img
        src="/images/agentPic.jpg"
        alt="Azmera field agent working alongside farmers"
        className="absolute inset-0 size-full object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-forest-deeper/85 via-forest-deeper/45 to-forest-deeper/90"
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col gap-8 p-8 text-white sm:p-10">
        <span className="inline-flex w-fit items-center rounded-2xl bg-white/95 px-3.5 py-2 shadow-sm">
          <img
            src="/images/logo.png"
            alt="Azmera"
            className="h-8 w-auto max-w-[9rem] object-contain"
          />
        </span>

        <div className="space-y-4">
          <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            Empowering Agriculture, Together.
          </h1>
          <p className="max-w-md text-sm leading-6 text-white/85">
            Join Azmera as a field agent and help connect Ethiopian farmers with
            better agricultural opportunities.
          </p>
        </div>

        <ul className="mt-auto grid gap-3">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.title}
              className="flex items-start gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur-sm"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
                <benefit.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {benefit.title}
                </p>
                <p className="text-xs leading-5 text-white/80">
                  {benefit.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
