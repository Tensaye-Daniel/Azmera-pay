import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-snow px-5 text-center">
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.18]" aria-hidden="true" />
      <div className="relative">
        <p className="text-xs font-semibold tracking-[0.24em] text-gold-dark uppercase">404</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-forest-dark sm:text-6xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-stone-dark sm:text-lg">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-9 inline-flex items-center justify-center rounded-full bg-forest px-8 py-4 text-sm font-semibold text-snow shadow-[0_14px_40px_rgba(35,139,69,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-dark"
        >
          Back to Home
        </Link>
      </div>
    </section>
  )
}
