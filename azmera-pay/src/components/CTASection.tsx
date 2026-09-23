import { ArrowRightIcon } from './icons'
import Reveal from './Reveal'

export default function CTASection() {
  return (
    <section id="cta" className="relative overflow-hidden bg-warmwhite py-24 lg:py-32">
      <div className="bg-ethiopian-pattern absolute inset-x-0 bottom-0 h-44 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-warmwhite shadow-[0_40px_90px_rgba(168,127,51,0.18)] ring-1 ring-gold/25">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative p-10 sm:p-14 lg:p-16">
                <span
                  className="absolute -top-16 -left-16 size-64 rounded-full bg-gold/25 blur-3xl"
                  aria-hidden="true"
                />
                <span
                  className="absolute right-8 -bottom-20 size-56 rounded-full bg-gold/15 blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.26em] text-gold-dark uppercase">
                    <span className="size-1.5 rounded-full bg-gold-dark" aria-hidden="true" />
                    Your partner in agricultural growth
                  </p>
                  <h2 className="mt-6 font-serif text-3xl leading-tight font-semibold tracking-tight text-forest-deeper sm:text-5xl">
                    Let’s Build a Stronger Agricultural Future{' '}
                    <span className="text-gold-dark">Together.</span>
                  </h2>
                  <p className="mt-6 max-w-lg text-base leading-relaxed text-forest/75 sm:text-lg">
                    Whether you’re a tomato farmer, input supplier or buyer, Azmera Pay matches you
                    with the right market — right from any phone.
                  </p>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <a
                      href="#how-it-works"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-forest-deeper shadow-[0_14px_40px_rgba(168,127,51,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest hover:text-warmwhite"
                    >
                      I’m a Buyer
                      <ArrowRightIcon className="size-4" />
                    </a>
                    <a
                      href="#suppliers"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-forest/30 bg-warmwhite/60 px-8 py-4 text-sm font-semibold text-forest-deeper backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-forest hover:bg-forest hover:text-warmwhite"
                    >
                      I’m a Supplier
                      <ArrowRightIcon className="size-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[300px] lg:min-h-0">
                <img
                  src="/images/hero-farmer.png"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-[55%_center]"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-warmwhite via-warmwhite/35 to-warmwhite/5"
                  aria-hidden="true"
                />
                <div className="bg-ethiopian-pattern absolute inset-0 opacity-10" aria-hidden="true" />
                <div className="absolute right-6 bottom-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-warmwhite/85 px-4 py-2 text-xs font-semibold text-forest-deeper backdrop-blur sm:right-8 sm:bottom-8">
                  <span className="size-1.5 rounded-full bg-gold-dark" aria-hidden="true" />
                  USSD · works on any phone
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}