import { Network, Sprout, UserPlus, type LucideIcon } from 'lucide-react'

const BENEFITS: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: UserPlus,
    title: 'Register Farmers',
    description: 'Onboard farmers with trusted, verifiable records.',
  },
  {
    icon: Network,
    title: 'Build Connections',
    description: 'Connect farmers with buyers and suppliers.',
  },
  {
    icon: Sprout,
    title: 'Grow Together',
    description: 'Create better agricultural opportunities.',
  },
]

interface AgentSignupHeroProps {
  headline?: string
  description?: string
}

export default function AgentSignupHero({
  headline = 'Empowering Agriculture, Together',
  description = 'Join Azmera as a field agent and help connect Ethiopian farmers with better agricultural opportunities.',
}: AgentSignupHeroProps) {
  return (
    <section className="relative hidden flex-col overflow-hidden bg-forest-deeper lg:flex lg:h-full lg:min-h-screen">
      <img
        src="/images/agentPic.jpg"
        alt="Azmera field agent in branded clothing using a smartphone"
        className="absolute inset-0 size-full object-cover object-center"
      />

      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/95 via-white/65 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col p-7 pb-44 sm:p-10 sm:pb-44">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-forest/10">
            <img
              src="/images/logo.png"
              alt="Azmera"
              className="h-8 w-auto max-w-[9rem] object-contain"
            />
          </span>
          <span className="text-sm font-semibold tracking-wide text-forest-deeper">
            Connect · Trade · Grow
          </span>
        </div>

        <div className="mt-6 max-w-md space-y-3">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-forest-deeper sm:text-4xl">
            {headline}
          </h1>
          <p className="text-sm leading-6 text-stone-dark">{description}</p>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl bg-forest-deeper/85 p-4 shadow-lg backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:p-5">
        <ul className="grid grid-cols-3 divide-x divide-white/20">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.title}
              className="flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:px-4 sm:text-left"
            >
              <benefit.icon
                className="size-6 shrink-0 text-white"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white sm:text-sm">
                  {benefit.title}
                </p>
                <p className="mt-0.5 hidden text-xs leading-5 text-white/75 sm:block">
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
