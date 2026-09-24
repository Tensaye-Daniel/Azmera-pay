import { ArrowRightIcon } from './icons'
import Reveal from './Reveal'

export default function CTASection() {
  return (
    <section id="cta" className="relative overflow-hidden bg-forest-deeper py-24 lg:py-36">
      <img
        src="/images/farmer2.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-right"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-forest-deeper/95 via-forest-dark/70 to-forest-dark/10"
        aria-hidden="true"
      />
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.15]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="relative max-w-2xl">
            <p className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.26em] text-gold uppercase">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              Your partner in agricultural growth
            </p>
            <h2 className="mt-6 font-serif text-3xl leading-tight font-semibold tracking-tight text-snow sm:text-5xl">
              Let’s Build a Stronger Agricultural Future{' '}
              <span className="text-gold">Together.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-snow/85 sm:text-lg">
              Whether you’re a tomato farmer, input supplier or buyer, Azmera Pay matches you
              with the right market — right from any phone.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
href="#buyers"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-forest-deeper shadow-[0_14px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-snow"
              >
                I’m a Buyer
                <ArrowRightIcon className="size-4" />
              </a>
              <a
href="#suppliers"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-snow/50 bg-snow/10 px-8 py-4 text-sm font-semibold text-snow backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-snow hover:text-forest-deeper"
              >
                I’m a Supplier
                <ArrowRightIcon className="size-4" />
              </a>
            </div>
            <div className="mt-9 inline-flex items-center gap-2 text-xs font-semibold text-gold">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              USSD · works on any phone
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}