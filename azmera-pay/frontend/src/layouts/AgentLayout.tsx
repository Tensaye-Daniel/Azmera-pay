import { useEffect, useRef, useState, type SVGProps } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronDownIcon,
  CloseIcon,
  LogOutIcon,
  MenuIcon,
  UsersIcon,
  SproutIcon,
  SettingsIcon,
} from '../components/ui/icons'
import AgentFooter from '../components/layout/AgentFooter'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { useAuthStore } from '../store/auth'

function OverviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

const getNavigation = (t: (key: string) => string) => [
  { label: t('nav.dashboard'), to: '/agent', icon: OverviewIcon, end: true },
  { label: t('nav.myFarmers'), to: '/agent/farmers', icon: UsersIcon },
  { label: t('nav.register'), to: '/agent/farmers/new', icon: SproutIcon, end: true },
  { label: t('nav.settings'), to: '/agent/settings', icon: SettingsIcon, end: true },
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2'

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function NavItems({ navigation }: { navigation: ReturnType<typeof getNavigation> }) {
  return (
    <ul className="space-y-1">
      {navigation.map(({ label, to, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${focusRing} ${
                isActive
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-stone-dark hover:bg-mint/40 hover:text-forest-deeper'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/15'
                      : 'bg-mint/30 group-hover:bg-mint/60'
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

function RegisterCard() {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl border border-forest/10 bg-[#f7faf6] p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint/60 text-forest-deeper">
          <SproutIcon className="size-5" />
        </span>
        <p className="text-sm font-semibold text-forest-deeper">
          {t('agent.addNewFarmer')}
        </p>
      </div>
      <p className="mt-3 text-xs leading-5 text-stone">
        {t('agent.shareNumberNotice')}
      </p>
      <NavLink
        to="/agent/farmers/new"
        className={`mt-3 block rounded-xl bg-forest px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-forest-deeper ${focusRing}`}
      >
        {t('agent.registerFarmerBtn')}
      </NavLink>
    </div>
  )
}

function AccountMenu({
  name,
  onSignOut,
}: {
  name: string
  onSignOut: () => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full border border-forest/10 bg-[#f7faf6] py-1 pl-1 pr-2 transition-colors hover:bg-mint/40 ${focusRing}`}
      >
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full bg-mint/60 text-xs font-semibold text-forest-deeper"
          aria-hidden="true"
        >
          {getInitials(name)}
        </span>
        <ChevronDownIcon
          className={`size-4 text-stone transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_18px_45px_rgba(22,95,48,0.15)]"
        >
          <div className="border-b border-forest/5 px-4 py-3">
            <p className="truncate text-sm font-semibold text-forest-deeper">
              {name}
            </p>
            <p className="text-xs text-stone">Agent</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className={`flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-stone-dark transition-colors hover:bg-mint/30 hover:text-forest-deeper ${focusRing}`}
          >
            <LogOutIcon className="size-4" />
            {t('nav.signOut')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AgentLayout() {
  const { t } = useTranslation()
  const navigation = getNavigation(t)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState<string | null>(null)
  const { pathname } = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const currentPage =
    navigation
      .filter(({ to, end }) =>
        end ? pathname === to : pathname.startsWith(to),
      )
      .sort((a, b) => b.to.length - a.to.length)[0]?.label ?? 'Agent'

  return (
    <div className="relative min-h-screen bg-[#f7faf6] text-stone-dark">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.15]" />
        <span className="absolute -top-24 right-[-6rem] size-80 rounded-full bg-mint blur-3xl" />
        <span className="absolute bottom-[-6rem] left-[10%] size-72 rounded-full bg-mint/70 blur-3xl" />
      </div>

      <a
        href="#agent-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
      >
        {t('nav.skipToContent')}
      </a>

      <header className="sticky top-0 z-40 border-b border-forest/10 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_16px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={mobileMenuOpen}
              aria-controls="agent-mobile-nav"
              className={`grid size-10 shrink-0 place-items-center rounded-xl border border-forest/15 text-forest transition-colors hover:bg-mint/40 lg:hidden ${focusRing}`}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="size-5" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </button>

            <NavLink
              to="/agent"
              aria-label="Azmera Pay home"
              className={`flex min-w-0 items-center rounded-lg ${focusRing}`}
            >
              <img
                src="/images/logo.png"
                alt="Azmera Pay"
                className="h-9 w-auto object-contain sm:h-10"
              />
            </NavLink>

            <div className="hidden items-center gap-3 md:flex" aria-hidden="true">
              <span className="h-6 w-px bg-forest/15" />
              <span className="text-sm font-medium text-stone">
                {currentPage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <AccountMenu
              name={user?.full_name ?? 'Agent'}
              onSignOut={handleLogout}
            />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] max-w-[1600px]">
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[208px] shrink-0 flex-col border-r border-forest/10 bg-white px-3 py-6 lg:flex">
          <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-stone/75">
            {t('nav.agentWorkspace')}
          </p>

          <nav aria-label="Agent navigation">
            <NavItems navigation={navigation} />
          </nav>

          <div className="mt-auto">
            <RegisterCard />
          </div>
        </aside>

        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 top-[68px] z-30 bg-stone-dark/30 backdrop-blur-sm transition-[opacity,visibility] duration-200 motion-reduce:transition-none lg:hidden ${
            mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        />

        <aside
          id="agent-mobile-nav"
          className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[min(300px,85vw)] flex-col border-r border-forest/10 bg-white px-3 py-5 shadow-xl transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:hidden ${
            mobileMenuOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
          }`}
        >
          <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-stone/75">
            {t('nav.agentWorkspace')}
          </p>

          <nav aria-label="Mobile agent navigation">
            <NavItems navigation={navigation} />
          </nav>

          <div className="mt-auto">
            <RegisterCard />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main
            id="agent-main"
            className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
          >
            <Outlet />
          </main>

          <AgentFooter />
        </div>
      </div>
    </div>
  )
}