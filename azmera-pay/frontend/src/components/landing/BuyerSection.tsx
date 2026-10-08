import Reveal from './Reveal'
import { ArrowRightIcon, LocateIcon, ShieldIcon, StoreIcon } from './icons'

const benefits = [
  {
    icon: StoreIcon,
    title: 'Source quality produce',
    text: 'Request any quantity of tomatoes and get matched with farmers who can supply it.',
  },
  {
    icon: LocateIcon,
    title: 'Match with nearby farms',
    text: 'Location-based matching connects you with the right farms at the right distance.',
  },
  {
    icon: ShieldIcon,
    title: 'Trade with confidence',
    text: 'Agree on quantity, price and delivery, then complete your trade through Azmera.',
  },
]

export default function BuyerSection() {
  return (
    <section id="buyers" className="relative overflow-hidden bg-snow py-24 lg:py-32">
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <span
        className="absolute -top-24 right-[-6rem] size-80 rounded-full bg-mint blur-3xl"
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
                  src="/images/buyer.png"
                  alt="Fresh tomatoes ready for buyers"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">
              For Buyers
            </p>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-dark sm:text-5xl">
              Buy Fresh.
              <br />
              <span className="text-gold-dark">Straight from the Farm.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-dark sm:text-lg">
              Tell us what you need and how much. Azmera matches you with farmers who can
              supply it, at the right distance, with terms agreed directly between you.
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
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-sm font-semibold text-snow shadow-[0_10px_30px_rgba(35,139,69,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-dark"
              >
                Request Tomatoes
                <ArrowRightIcon className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}