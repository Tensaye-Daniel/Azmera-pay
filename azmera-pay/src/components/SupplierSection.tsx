import Reveal from './Reveal'
import { ArrowRightIcon, EyeIcon, GlobeIcon, HeartIcon, UsersIcon, CheckIcon } from './icons'

const benefits = [
  {
    icon: GlobeIcon,
    title: 'Reach bigger markets',
    text: 'Get matched with businesses across the country in a simple request-and-match USSD exchange.',
  },
  {
    icon: EyeIcon,
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
    <section id="suppliers" className="relative overflow-hidden bg-sage/60 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">
              For Suppliers & Farmers
            </p>
            <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-forest-deeper sm:text-5xl">
              Reach More Buyers.
              <br />
              <span className="text-gold-dark">Grow Your Market.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-softgreen sm:text-lg">
              Azmera Pay helps tomato farmers and input suppliers connect with businesses looking
              for quality Ethiopian produce — entirely over USSD.
            </p>

            <ul className="mt-10 space-y-6">
              {benefits.map((benefit, i) => (
                <li key={benefit.title}>
                  <Reveal delay={i * 100}>
                    <div className="group flex items-start gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-warmwhite text-forest shadow-sm ring-1 ring-forest/10 transition-all duration-300 group-hover:bg-forest group-hover:text-gold">
                        <benefit.icon className="size-6" />
                      </span>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-forest-deeper">
                          {benefit.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-softgreen">{benefit.text}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#cta"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-sm font-semibold text-warmwhite shadow-[0_10px_30px_rgba(20,81,61,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-dark"
              >
                Become a Supplier
                <ArrowRightIcon className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="bg-ethiopian-pattern absolute -left-8 -top-8 hidden h-36 w-36 opacity-70 lg:block" aria-hidden="true" />
            <div className="overflow-hidden rounded-[2.5rem] shadow-[0_30px_80px_rgba(13,68,50,0.3)] ring-1 ring-forest/10">
              <img
                src="/images/hero-farmer.png"
                alt="Ethiopian farmer working in a field with his produce"
                className="aspect-[4/5] w-full object-cover sm:aspect-[4/4.4]"
              />
            </div>
            <div className="absolute -bottom-7 -right-4 max-w-[270px] rounded-3xl bg-warmwhite p-6 shadow-[0_20px_50px_rgba(13,68,50,0.22)] sm:-right-8">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-sage text-forest">
                  <UsersIcon className="size-5" />
                </span>
                <div>
                  <p className="font-serif text-xl font-bold text-forest-deeper">500+</p>
                  <p className="text-xs font-medium text-softgreen">tomato farmers already onboard</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-forest/10 pt-3 text-xs font-semibold text-forest">
                <CheckIcon className="size-4 text-gold-dark" />
                Listed via USSD · matched with buyers & inputs
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}