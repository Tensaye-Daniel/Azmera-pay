import Reveal from './Reveal'
import { NetworkIcon, ShieldIcon, SproutIcon, TagIcon } from './icons'

const pillars = [
  {
    icon: ShieldIcon,
    title: 'Verified Suppliers',
    text: 'Connect with trusted tomato and input suppliers.',
  },
  {
    icon: TagIcon,
    title: 'Transparent Pricing',
    text: 'Clear pricing and product information.',
  },
  {
    icon: NetworkIcon,
    title: 'Direct Connections',
    text: 'Bring farmers, input suppliers and buyers closer together.',
  },
  {
    icon: SproutIcon,
    title: 'USSD-First Access',
    text: 'Trade with a simple USSD code — built for any phone, anywhere in Ethiopia.',
  },
]

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-forest py-24 lg:py-32">
      <span
        className="absolute -left-28 top-0 size-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="absolute -right-28 bottom-0 size-96 rounded-full bg-forest-deeper blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-gold uppercase">Why Azmera Pay</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-warmwhite sm:text-5xl">
            Built Around <span className="text-gold">Trust</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-warmwhite/70 sm:text-lg">
            Every feature at Azmera Pay exists to make trade safer, clearer and more human.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 100}>
              <div className="group h-full rounded-[1.75rem] border border-warmwhite/12 bg-warmwhite/5 p-7 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:bg-warmwhite/10">
                <span className="grid size-13 place-items-center rounded-2xl bg-gold/15 text-gold transition-all duration-300 group-hover:bg-gold group-hover:text-forest-deeper">
                  <pillar.icon className="size-7" />
                </span>
                <h3 className="mt-6 font-serif text-lg font-semibold text-warmwhite">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-warmwhite/70">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}