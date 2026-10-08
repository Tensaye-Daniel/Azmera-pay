import { FacebookIcon, InstagramIcon, LinkedInIcon, TelegramIcon, XIcon } from './icons'

const socials = [
  { label: 'Facebook', href: '#', icon: FacebookIcon },
  { label: 'Instagram', href: '#', icon: InstagramIcon },
  { label: 'X', href: '#', icon: XIcon },
  { label: 'Telegram', href: '#', icon: TelegramIcon },
  { label: 'LinkedIn', href: '#', icon: LinkedInIcon },
]

const links = [
  { label: 'About', href: '#about' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Buyers', href: '#buyers' },
  { label: 'For Suppliers', href: '#suppliers' },
  { label: 'For Agents', href: '#agents' },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden text-snow">
      <div className="absolute inset-0 bg-gradient-to-b from-forest via-forest-dark to-forest-deeper" />
      <div className="bg-ethiopian-pattern absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-8 sm:px-8">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-11 place-items-center rounded-full border border-snow/20 bg-snow/10 text-snow transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-forest-deeper"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-snow/75 transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-snow/25 to-transparent" />

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <p className="text-sm text-snow/70">© 2026 Azmera. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-snow/70">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              Made with care for Ethiopian agriculture
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}