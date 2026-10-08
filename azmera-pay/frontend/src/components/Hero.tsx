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
          <div className="absolute inset-0 bg-gradient-to-b from-forest/8 via-mint/30 to-mint/60" />
          <div className="absolute inset-0 bg-[radial-gradient(58%_62%_at_50%_46%,rgba(255,255,255,0.7),rgba(255,255,255,0)_72%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-transparent" />
          <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]" aria-hidden="true" />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-gold/60 bg-snow/70 px-4 py-1.5 text-xs font-semibold tracking-[0.26em] text-gold-dark uppercase backdrop-blur">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            Ethiopian Agriculture
          </p>

          <h1 className="mx-auto mt-7 max-w-3xl font-serif text-[2.7rem] leading-[1.06] font-semibold tracking-tight text-forest-dark sm:text-6xl xl:text-7xl">
            Connecting
            <br />
            Ethiopia’s Farms
            <br />
            <span className="relative inline-block text-gold-dark">
              to the Future
              <svg
                aria-hidden="true"
                viewBox="0 0 220 12"
                className="absolute -bottom-2 left-0 w-full text-gold/80"
                preserveAspectRatio="none"
              >
                <path d="M3 9C60 3 160 3 217 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-forest-dark/80 sm:text-lg">
            Azmera connects Ethiopian tomato farmers with buyers and input suppliers through
            smart, location-based matching, from registration to final sale, all from any phone.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#buyers"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-sm font-semibold text-snow shadow-[0_14px_40px_rgba(35,139,69,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-dark"
            >
              I’m a Buyer
              <ArrowRightIcon className="size-4" />
            </a>
            <a
              href="#suppliers"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-forest/50 bg-snow/50 px-8 py-4 text-sm font-semibold text-forest-dark backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest hover:text-snow"
            >
              I’m a Supplier
              <ArrowRightIcon className="size-4" />
            </a>
            <a
              href="#agents"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-forest/50 bg-snow/50 px-8 py-4 text-sm font-semibold text-forest-dark backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest hover:text-snow"
            >
              I’m an Agent
              <ArrowRightIcon className="size-4" />
            </a>
          </div>
        </div>
    </section>
  )
}