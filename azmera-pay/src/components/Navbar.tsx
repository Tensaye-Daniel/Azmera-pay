import { useEffect, useState } from 'react'
import { CloseIcon, MenuIcon } from './icons'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Buyers', href: '#how-it-works' },
  { label: 'For Suppliers', href: '#suppliers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled && !open ? 'bg-warmwhite/90 shadow-[0_1px_24px_rgba(13,68,50,0.08)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8"
      >
        <a href="#home" className="group flex items-center gap-3" onClick={close}>
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-forest shadow-sm transition-transform duration-300 group-hover:scale-105">
            <img src="/images/logo-mark.svg" alt="" width={44} height={44} className="size-11" />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={`font-serif text-lg font-semibold tracking-wide sm:text-xl ${
                open || !scrolled ? 'text-warmwhite' : 'text-forest-dark'
              }`}
            >
              AZMERA <span className="text-gold">PAY</span>
            </span>
            <span
              className={`mt-1 text-[10px] font-medium tracking-[0.18em] uppercase sm:text-[11px] ${
                open || !scrolled ? 'text-warmwhite/75' : 'text-softgreen'
              }`}
            >
              Your partner in agricultural growth
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:transition-all after:duration-300 hover:after:w-full ${
                  scrolled
                    ? 'text-forest-dark/85 hover:text-forest after:bg-gold'
                    : 'text-warmwhite/85 hover:text-warmwhite after:bg-gold'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className={`hidden rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 sm:inline-flex ${
              scrolled
                ? 'border-forest-dark/25 text-forest-dark hover:border-forest hover:bg-forest hover:text-warmwhite'
                : 'border-warmwhite/40 text-warmwhite hover:border-warmwhite hover:bg-warmwhite hover:text-forest-deeper'
            }`}
          >
            Log in
          </a>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className={`grid size-11 place-items-center rounded-full backdrop-blur transition-colors lg:hidden ${
              open
                ? 'border border-warmwhite/40 bg-warmwhite/10 text-warmwhite'
                : 'border border-forest-dark/15 bg-warmwhite/80 text-forest-dark hover:bg-forest hover:text-warmwhite'
            }`}
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 top-0 -z-10 bg-forest-deeper/95 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={close}
      >
        <div className="bg-ethiopian-pattern absolute inset-0 opacity-40" />
        <nav
          aria-label="Mobile"
          className={`flex h-full flex-col justify-center px-8 transition-transform duration-500 ease-out ${
            open ? 'translate-y-0' : '-translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-8 flex items-center gap-3">
            <img src="/images/logo-mark.svg" alt="" width={44} height={44} className="size-11" />
            <span className="font-serif text-xl font-semibold tracking-wide text-warmwhite">
              AZMERA <span className="text-gold">PAY</span>
            </span>
          </div>
          <ul className="space-y-2">
            {links.map((link, i) => (
              <li key={link.href} style={{ transitionDelay: `${i * 40}ms` }}>
                <a
                  href={link.href}
                  onClick={close}
                  className="group flex items-center justify-between border-b border-warmwhite/10 py-4 font-serif text-2xl font-medium text-warmwhite transition-colors hover:text-gold"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="text-warmwhite/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gold"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            onClick={close}
            className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-semibold text-forest-deeper transition-colors hover:bg-warmwhite"
          >
            Log in
          </a>
        </nav>
      </div>
    </header>
  )
}