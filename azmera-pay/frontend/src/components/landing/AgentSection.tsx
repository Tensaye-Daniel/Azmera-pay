import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal'
import { ArrowRightIcon, LocateIcon, TrendingIcon, UsersIcon } from '../ui/icons'

const benefits = [
  {
    icon: UsersIcon,
    title: 'Register farmers with ease',
    text: 'Create and update farmer profiles (location, crops, capacity and needs) through simple USSD flows on any phone.',
  },
  {
    icon: LocateIcon,
    title: 'Know your local market',
    text: 'See active requests and matches in your area, then connect the right farmers and businesses directly.',
  },
  {
    icon: TrendingIcon,
    title: 'Earn as your community grows',
    text: 'Build a steady income as the farmers you register start finding buyers and suppliers for every season.',
  },
]

export default function AgentSection() {
  return (
    <section id="agents" className="relative overflow-hidden bg-snow py-24 lg:py-32">
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <span
        className="absolute -top-24 left-[-6rem] size-80 rounded-full bg-mint blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative">
              <div
                className="bg-ethiopian-pattern absolute -left-8 -top-8 hidden h-36 w-36 opacity-50 lg:block"
                aria-hidden="true"
              />
              <div className="overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_rgba(35,139,69,0.25)] ring-1 ring-forest/10">
                <img
                  src="/images/Agent.jpg"
                  alt="An Azmera Agent with a farmer in the field"
                  onError={(e) => {
                    e.currentTarget.src = '/images/farmer2.jpg'
                  }}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">
              For Agents
            </p>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-dark sm:text-5xl">
              Empower Farmers.
              <br />
              <span className="text-gold-dark">Grow Your Own Income.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-dark sm:text-lg">
              Azmera Agents are trusted local representatives who bring farmers onto the platform,
              submit requests on their behalf and help every match happen right from their own
              community, with no smartphone required.
            </p>

            <ul className="mt-10 space-y-6">
              {benefits.map((benefit, i) => (
                <li key={benefit.title}>
                  <Reveal delay={i * 100}>
                    <div className="group flex items-start gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-snow text-forest-dark shadow-sm ring-1 ring-forest/15 transition-all duration-300 group-hover:bg-forest group-hover:text-gold">
                        <benefit.icon className="size-6" />
                      </span>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-forest-dark">
                          {benefit.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-stone">{benefit.text}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-sm font-semibold text-snow shadow-[0_10px_30px_rgba(35,139,69,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-dark"
              >
                Become an Agent
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
