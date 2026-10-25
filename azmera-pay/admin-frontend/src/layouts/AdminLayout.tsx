import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDownIcon,
  CloseIcon,
  LogOutIcon,
  MenuIcon,
  ShieldIcon,
  SproutIcon,
  StoreIcon,
  TrendingIcon,
  UsersIcon,
} from '../components/ui/icons'
import { useAuthStore } from '../store/auth'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2'

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

interface AdminNavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
}

function NavItems({ items }: { items: AdminNavItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map(({ to, label, icon: Icon, end }) => (
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
                    isActive ? 'bg-white/15' : 'bg-mint/30 group-hover:bg-mint/60'
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

function AccountMenu({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
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
        aria-label="Account menu"
        className={`flex items-center gap-2 rounded-full border border-forest/10 bg-[#f7faf6] py-1 pl-1 pr-2 transition-colors hover:bg-mint/40 ${focusRing}`}
      >
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full bg-mint/60 text-xs font-semibold text-forest-deeper"
          aria-hidden="true"
        >
          {getInitials(name) || 'AD'}
        </span>
        <ChevronDownIcon
          className={`size-4 text-stone transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_18px_45px_rgba(22,95,48,0.15)]"
        >
          <div className="border-b border-forest/5 px-4 py-3">
            <p className="truncate text-sm font-semibold text-forest-deeper">{name}</p>
            <p className="text-xs text-stone">Administrator</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className={`flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-stone-dark transition-colors hover:bg-mint/30 hover:text-forest-deeper ${focusRing}`}
          >
            <LogOutIcon className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

const AdminLayout = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState<string | null>(null)

  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setMobileMenuOpen(false)
  }

  const navItems: AdminNavItem[] = [
    { to: '/', label: 'Overview', icon: TrendingIcon, end: true },
    { to: '/farmers', label: 'Farmers', icon: SproutIcon },
    { to: '/suppliers', label: 'Suppliers', icon: StoreIcon },
    { to: '/users', label: 'Users', icon: UsersIcon },
  ]

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
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
    navItems.find(({ to, end }) =>
      end ? pathname === to : pathname.startsWith(to),
    )?.label ?? 'Admin'

  return (
    <div className="relative min-h-screen bg-[#f7faf6] text-stone-dark">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="bg-ethiopian-pattern absolute inset-0 opacity-[0.15]" />
        <span className="absolute -top-24 right-[-6rem] size-80 rounded-full bg-mint blur-3xl" />
        <span className="absolute bottom-[-6rem] left-[10%] size-72 rounded-full bg-mint/70 blur-3xl" />
      </div>

      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-forest/10 bg-white/95 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_16px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-nav"
              className={`grid size-10 shrink-0 place-items-center rounded-xl border border-forest/15 text-forest transition-colors hover:bg-mint/40 lg:hidden ${focusRing}`}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="size-5" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </button>

            <NavLink
              to="/"
              aria-label="Azmera Pay admin home"
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
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stone">
                <ShieldIcon className="size-4 text-forest" />
                {currentPage}
              </span>
            </div>
          </div>

          <AccountMenu
            name={user?.full_name ?? 'Administrator'}
            onSignOut={handleLogout}
          />
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] max-w-[1600px]">
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[220px] shrink-0 flex-col border-r border-forest/10 bg-white px-3 py-6 lg:flex">
          <div className="mb-4 flex items-center gap-2 px-3">
            <span className="grid size-9 place-items-center rounded-xl bg-forest/10 text-forest-deeper">
              <ShieldIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-forest-deeper">Admin console</p>
              <p className="text-xs text-stone">Platform oversight</p>
            </div>
          </div>

          <nav aria-label="Admin navigation">
            <NavItems items={navItems} />
          </nav>

          <div className="mt-auto rounded-2xl border border-forest/10 bg-[#f7faf6] p-4">
            <p className="text-xs leading-5 text-stone">
              Review farmer registrations and supplier applications to keep the
              marketplace trusted.
            </p>
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
          id="admin-mobile-nav"
          className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[min(300px,85vw)] flex-col border-r border-forest/10 bg-white px-3 py-5 shadow-xl transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:hidden ${
            mobileMenuOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
          }`}
        >
          <div className="mb-4 flex items-center gap-2 px-3">
            <span className="grid size-9 place-items-center rounded-xl bg-forest/10 text-forest-deeper">
              <ShieldIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-forest-deeper">Admin console</p>
              <p className="text-xs text-stone">Platform oversight</p>
            </div>
          </div>

          <nav aria-label="Mobile admin navigation">
            <NavItems items={navItems} />
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main
            id="admin-main"
            className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
