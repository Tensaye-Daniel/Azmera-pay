import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CloseIcon, MenuIcon } from '../ui/icons'
import LanguageSwitcher from '../ui/LanguageSwitcher'

export default function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const links = [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.howItWorks'), href: '#how-it-works' },
    { label: t('nav.forBuyers'), href: '#buyers' },
    { label: t('nav.forSuppliers'), href: '#suppliers' },
    { label: t('nav.forAgents'), href: '#agents' },
  ]

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
        scrolled && !open ? 'bg-white/95 shadow-[0_1px_24px_rgba(35,139,69,0.12)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8"
      >
        <a href="#home" className="group flex items-center" onClick={close}>
          <img
            src="/images/logo.png"
            alt="Azmera"
            width={1280}
            height={698}
            className="h-11 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:transition-all after:duration-300 hover:after:w-full text-forest-dark/85 hover:text-forest-dark after:bg-gold`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            className={`grid size-11 place-items-center rounded-full border border-forest/20 bg-white/90 text-forest backdrop-blur transition-colors hover:bg-forest hover:text-snow lg:hidden ${
              open ? 'border-snow/40 bg-snow/10 text-snow hover:bg-snow/20' : ''
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
        <div className="bg-ethiopian-pattern absolute inset-0 opacity-30" />
        <nav
          aria-label="Mobile"
          className={`flex h-full flex-col justify-center px-8 transition-transform duration-500 ease-out ${
            open ? 'translate-y-0' : '-translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-8 flex items-center justify-between">
            <img src="/images/logo.png" alt="Azmera" width={1280} height={698} className="h-12 w-auto object-contain drop-shadow-lg" />
            <LanguageSwitcher theme="dark" />
          </div>
          <ul className="space-y-2">
            {links.map((link, i) => (
              <li key={link.href} style={{ transitionDelay: `${i * 40}ms` }}>
                <a
                  href={link.href}
                  onClick={close}
                  className="group flex items-center justify-between border-b border-snow/10 py-4 font-serif text-2xl font-medium text-snow transition-colors hover:text-gold"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="text-snow/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gold"
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}