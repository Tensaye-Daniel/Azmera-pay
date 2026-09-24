import Reveal from './Reveal'
import { ArrowRightIcon, GlobeIcon, HeartIcon, LeafIcon } from './icons'

const benefits = [
  {
    icon: GlobeIcon,
    title: 'Reach bigger markets',
    text: 'Get matched with businesses across the country in a simple request-and-match USSD exchange.',
  },
  {
    icon: LeafIcon,
    title: 'Match with input suppliers',
    text: 'Get matched with trusted seed and fertilizer suppliers to grow a better, bigger crop.',
  },
  {
    icon: HeartIcon,
    title: 'Build trusted buyer relationships',
    text: 'Repeat buyers who know your farm — and keep coming back.',
  },
]

export default function SupplierSection() {
  return (
    <section id="suppliers" className="relative overflow-hidden bg-snow py-24 lg:py-32">
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <span
        className="absolute -bottom-24 left-[-6rem] size-80 rounded-full bg-mint blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">
              For Suppliers & Farmers
            </p>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-dark sm:text-5xl">
              Reach More Buyers.
              <br />
              <span className="text-gold-dark">Grow Your Market.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-dark sm:text-lg">
              Azmera Pay helps tomato farmers and input suppliers connect with businesses looking
              for quality Ethiopian produce — entirely over USSD.
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
              <a
                href="#cta"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-sm font-semibold text-snow shadow-[0_10px_30px_rgba(35,139,69,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-dark"
              >
                Become a Supplier
                <ArrowRightIcon className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div
                className="bg-ethiopian-pattern absolute -right-8 -top-8 hidden h-36 w-36 opacity-50 lg:block"
                aria-hidden="true"
              />
              <div className="overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_rgba(35,139,69,0.25)] ring-1 ring-forest/10">
                <img
                  src="/images/supllier.png"
                  alt="Farmer in a field near harvest"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}