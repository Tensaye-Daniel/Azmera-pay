import Reveal from './Reveal'
import {
  GlobeIcon,
  PhoneIcon,
  ShieldIcon,
  SproutIcon,
  TagIcon,
  UsersIcon,
} from './icons'

const steps = [
  {
    icon: SproutIcon,
    step: '01',
    title: 'Register',
    text: 'Farmers are registered by Azmera Agents with a digital profile — location, crops, production capacity and farming needs.',
  },
  {
    icon: PhoneIcon,
    step: '02',
    title: 'Request',
    text: 'Farmers request inputs like seeds, fertilizer or pesticides. Buyers request products and quantities — for example, 50,000 kg of tomatoes.',
  },
  {
    icon: GlobeIcon,
    step: '03',
    title: 'Match',
    text: 'Our system matches requests with suitable suppliers based on location, distance, availability, product, price and more.',
  },
  {
    icon: UsersIcon,
    step: '04',
    title: 'Connect',
    text: 'The matched farmer and supplier — or buyer and farmer — connect directly and discuss the details.',
  },
  {
    icon: TagIcon,
    step: '05',
    title: 'Agree',
    text: 'Both sides agree on quantity, price, delivery and the terms of the transaction.',
  },
  {
    icon: ShieldIcon,
    step: '06',
    title: 'Trade',
    text: 'Azmera Pay brings them together so the transaction can move forward with confidence.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-snow py-24 lg:py-32">
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <span className="absolute -right-24 -top-24 size-96 rounded-full bg-mint/70 blur-3xl" aria-hidden="true" />
      <span className="absolute -left-32 top-1/2 size-80 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">The process</p>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-dark sm:text-5xl">
            How Azmera Pay Works
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone-dark sm:text-lg">
            Register → Request → Match → Connect → Agree → Trade. Azmera Pay connects farmers,
            suppliers and buyers through a smart, location-based matching system — right from any
            phone.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.step} delay={i * 80}>
              <div className="group relative h-full rounded-3xl border border-forest/10 bg-snow/60 p-7 shadow-[0_6px_24px_rgba(35,139,69,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-forest/30 hover:shadow-[0_18px_40px_rgba(35,139,69,0.12)]">
                <div className="flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-forest text-gold shadow-[0_10px_30px_rgba(35,139,69,0.25)] transition-transform duration-500 group-hover:-rotate-6">
                    <step.icon className="size-7" />
                  </span>
                  <span className="font-serif text-4xl font-semibold text-forest/15 transition-colors duration-500 group-hover:text-gold/60">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-lg font-semibold text-forest-dark">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}