import { ArrowRightIcon } from './icons'

export default function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden py-32 lg:py-44">
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero-farmer.png"
          alt=""
          className="h-full w-full object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/94 via-forest-dark/88 to-forest-deeper/94" />
        <div className="bg-ethiopian-pattern absolute inset-0 opacity-20" aria-hidden="true" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-warmwhite/5 px-4 py-1.5 text-xs font-semibold tracking-[0.26em] text-gold uppercase backdrop-blur">
          <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
          Ethiopian Agriculture
        </p>

        <h1 className="mx-auto mt-7 max-w-3xl font-serif text-[2.7rem] leading-[1.06] font-semibold tracking-tight text-warmwhite sm:text-6xl xl:text-7xl">
          Connecting
          <br />
          Ethiopia’s Farms
          <br />
          <span className="relative inline-block text-gold">
            to the Future
            <svg
              aria-hidden="true"
              viewBox="0 0 220 12"
              className="absolute -bottom-2 left-0 w-full text-gold/60"
              preserveAspectRatio="none"
            >
              <path d="M3 9C60 3 160 3 217 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-warmwhite/80 sm:text-lg">
          Azmera Pay matches tomato farmers with buyers — and with input suppliers for seeds and
          fertilizer — using a smart, location-based matching system, right from any phone. Your
          partner in agricultural growth.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-forest-deeper shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-warmwhite hover:text-forest-dark"
          >
            I’m a Buyer
            <ArrowRightIcon className="size-4" />
          </a>
          <a
            href="#suppliers"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-warmwhite/40 bg-warmwhite/5 px-8 py-4 text-sm font-semibold text-warmwhite backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-warmwhite hover:bg-warmwhite/15"
          >
            I’m a Supplier
            <ArrowRightIcon className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}