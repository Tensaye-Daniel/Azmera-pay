import Reveal from './Reveal'
import { LeafIcon, TrendingIcon, UsersIcon } from './icons'

const features = [
  {
    icon: LeafIcon,
    title: 'Support Farmers',
    text: 'Tomato farmers list and sell using simple USSD codes — with Azmera Agents helping them reach bigger markets.',
  },
  {
    icon: UsersIcon,
    title: 'Connect Markets',
    text: 'We bring tomato buyers, farmers and input suppliers together in one trusted platform.',
  },
  {
    icon: TrendingIcon,
    title: 'Build a Stronger Future',
    text: 'More income, better opportunities, and a healthier food system for Ethiopia.',
  },
]

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-cream py-24 lg:py-32">
      <div
        className="bg-ethiopian-pattern absolute inset-x-0 top-0 h-40 opacity-50"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">
            About us
          </p>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-deeper sm:text-5xl">
            Rooted in Ethiopia.
            <br />
            Built for a <span className="text-gold-dark">Stronger Tomorrow</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-softgreen sm:text-lg">
            Azmera Pay is a USSD-first digital marketplace that matches Ethiopian tomato farmers
            with buyers — and with input suppliers for seeds, fertilizer and more. We make trade
            simpler, faster and fairer — so that local farmers can grow, businesses can thrive, and
            Ethiopia’s agricultural potential can reach more people.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 110}>
              <div className="group relative h-full overflow-hidden rounded-[1.75rem] bg-warmwhite p-8 shadow-[0_6px_30px_rgba(13,68,50,0.06)] ring-1 ring-forest/8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(13,68,50,0.12)]">
                <span
                  className="absolute -right-6 -top-6 size-24 rounded-full bg-sage/70 transition-transform duration-500 group-hover:scale-125"
                  aria-hidden="true"
                />
                <span className="relative grid size-14 place-items-center rounded-2xl bg-forest text-gold shadow-sm transition-transform duration-500 group-hover:rotate-6">
                  <feature.icon className="size-7" />
                </span>
                <h3 className="relative mt-6 font-serif text-xl font-semibold text-forest-deeper">
                  {feature.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-softgreen sm:text-base">
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