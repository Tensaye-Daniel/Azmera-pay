const columns = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Contact', href: '#cta' },
    ],
  },
  {
    title: 'For Buyers',
    links: [
      { label: 'How Buying Works', href: '#how-it-works' },
      { label: 'Request Tomatoes', href: '#how-it-works' },
      { label: 'Find Suppliers', href: '#suppliers' },
    ],
  },
  {
    title: 'For Suppliers',
    links: [
      { label: 'Become a Supplier', href: '#suppliers' },
      { label: 'Share Your Products', href: '#how-it-works' },
      { label: 'Request Inputs', href: '#how-it-works' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact', href: '#cta' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest-deeper text-warmwhite">
      <div className="bg-ethiopian-pattern absolute inset-x-0 top-0 h-32 opacity-15" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <a href="#home" className="flex items-center gap-3">
              <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-forest ring-1 ring-warmwhite/20">
                <img src="/images/logo-mark.svg" alt="" width={48} height={48} className="size-12" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-serif text-xl font-semibold tracking-wide">
                  AZMERA <span className="text-gold">PAY</span>
                </span>
                <span className="mt-1 text-[10px] font-medium tracking-[0.18em] text-warmwhite/70 uppercase">
                  Your partner in agricultural growth
                </span>
              </span>
            </a>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-warmwhite/70">
              A USSD-first marketplace that matches tomato farmers with buyers — and with input
              suppliers — making agricultural trade simpler, faster and fairer.
            </p>
            <a
              href="#cta"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-sm font-semibold text-gold transition-all duration-300 hover:bg-gold hover:text-forest-deeper"
            >
              Get started today
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-warmwhite/75 transition-colors duration-200 hover:text-gold"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-warmwhite/10 pt-8 sm:flex-row">
          <p className="text-sm text-warmwhite/60">© 2026 Azmera Pay. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-warmwhite/60">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            Made with care for Ethiopian agriculture
          </div>
        </div>
      </div>
    </footer>
  )
}