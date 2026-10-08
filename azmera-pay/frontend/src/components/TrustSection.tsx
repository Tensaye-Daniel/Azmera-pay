import Reveal from './Reveal'
import { NetworkIcon, ShieldIcon, SproutIcon, TagIcon } from './icons'

const pillars = [
  {
    icon: ShieldIcon,
    title: 'Verified Suppliers',
    text: 'Suppliers are onboarded and vetted by local Azmera Agents before they trade on the platform.',
  },
  {
    icon: TagIcon,
    title: 'Transparent Pricing',
    text: 'Both sides agree on prices and terms directly, with everything clear before anyone commits.',
  },
  {
    icon: NetworkIcon,
    title: 'Direct Connections',
    text: 'Farmers, agents, input suppliers and buyers deal with each other directly, with no layers in between.',
  },
  {
    icon: SproutIcon,
    title: 'USSD-First Access',
    text: 'Trade with a simple USSD code that works on any phone, anywhere in Ethiopia.',
  },
]

export default function TrustSection() {
  return (
    <section id="why-us" className="relative overflow-hidden bg-snow py-24 lg:py-32">
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <span
        className="absolute -left-28 top-0 size-96 rounded-full bg-mint blur-3xl"
        aria-hidden="true"
      />
      <span
        className="absolute -right-28 bottom-0 size-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">Why Azmera</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-dark sm:text-5xl">
            Built Around <span className="text-gold-dark">Trust</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone-dark sm:text-lg">
            Every part of Azmera is designed to make agricultural trade safer, clearer and
            fairer for everyone involved.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 100}>
              <div className="group h-full rounded-[1.75rem] border border-forest/10 bg-snow/60 p-7 shadow-[0_6px_24px_rgba(35,139,69,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-forest/30 hover:shadow-[0_18px_40px_rgba(35,139,69,0.12)]">
                <span className="grid size-13 place-items-center rounded-2xl bg-mint text-forest-dark transition-all duration-300 group-hover:bg-forest group-hover:text-gold">
                  <pillar.icon className="size-7" />
                </span>
                <h3 className="mt-6 font-serif text-lg font-semibold text-forest-dark">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}