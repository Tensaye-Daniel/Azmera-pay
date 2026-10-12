import { Link } from 'react-router-dom'

const links = [
  { label: 'Dashboard', to: '/agent' },
  { label: 'My Farmers', to: '/agent/farmers' },
  { label: 'Register', to: '/agent/farmers/new' },
  { label: 'Settings', to: '/agent/settings' },
]

export default function AgentFooter() {
  return (
    <footer className="relative overflow-hidden text-snow">
      <div className="absolute inset-0 bg-gradient-to-b from-forest via-forest-dark to-forest-deeper" />
      <div
        className="bg-ethiopian-pattern absolute inset-0 opacity-30"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <span className="inline-flex rounded-xl bg-white px-3 py-2">
              <img
                src="/images/logo.png"
                alt="Azmera Pay"
                className="h-8 w-auto object-contain"
              />
            </span>
            <p className="mt-4 text-sm leading-6 text-snow/75">
              Agent workspace — register farmers, manage accounts, and help
              them order inputs over USSD.
            </p>
          </div>

          <nav
            aria-label="Workspace"
            className="flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-snow/75 transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-snow/25 to-transparent" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-snow/70">
            © 2026 Azmera. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-snow/70">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            Made with care for Ethiopian agriculture
          </div>
        </div>
      </div>
    </footer>
  )
}
