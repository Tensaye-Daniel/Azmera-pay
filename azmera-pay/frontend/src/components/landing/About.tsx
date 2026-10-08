import Reveal from '../ui/Reveal'
import { LeafIcon, TrendingIcon, UsersIcon } from '../ui/icons'

const features = [
  {
    icon: LeafIcon,
    title: 'Support Farmers',
    text: 'Farmers list their harvest and their needs with simple USSD codes, guided by local Azmera Agents, on any phone.',
  },
  {
    icon: UsersIcon,
    title: 'Connect Markets',
    text: 'Buyers, farmers and input suppliers meet in one trusted marketplace, matched by location and availability.',
  },
  {
    icon: TrendingIcon,
    title: 'Build a Stronger Future',
    text: 'Fairer prices, shorter supply chains and stronger incomes for everyone in Ethiopia’s agricultural economy.',
  },
]

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-snow py-24 lg:py-32">
      <div
        className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]"
        aria-hidden="true"
      />
      <span
        className="absolute -top-24 right-[-6rem] size-80 rounded-full bg-mint blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">
            About us
          </p>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-dark sm:text-5xl">
            Rooted in Ethiopia.
            <br />
            Built for a <span className="text-gold-dark">Stronger Tomorrow</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-stone-dark sm:text-lg">
            Azmera is a USSD-first marketplace that connects Ethiopian tomato farmers with
            buyers and input suppliers for seeds, fertilizer and more. We make trade simpler,
            faster and fairer, so farmers earn more, businesses find reliable supply, and
            Ethiopia’s agricultural potential reaches further.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 110}>
              <div className="group relative h-full overflow-hidden rounded-[1.75rem] bg-snow p-8 shadow-[0_6px_30px_rgba(35,139,69,0.06)] ring-1 ring-forest/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(35,139,69,0.14)]">
                <span
                  className="absolute -right-6 -top-6 size-24 rounded-full bg-mint transition-transform duration-500 group-hover:scale-125"
                  aria-hidden="true"
                />
                <span className="relative grid size-14 place-items-center rounded-2xl bg-forest text-gold shadow-sm transition-transform duration-500 group-hover:rotate-6">
                  <feature.icon className="size-7" />
                </span>
                <h3 className="relative mt-6 font-serif text-xl font-semibold text-forest-dark">
                  {feature.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-stone sm:text-base">
                  {feature.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}