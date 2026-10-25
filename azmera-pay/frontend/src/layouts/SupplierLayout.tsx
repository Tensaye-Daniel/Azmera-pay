import {
  createContext,
  useContext,
  useEffect,
  useState,
  type SVGProps,
} from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/auth'
import { fetchMe, invalidateRefreshToken } from '../api/auth'
import { fetchSupplierProfile } from '../api/supplier'
import {
  CloseIcon,
  MenuIcon,
  StoreIcon,
  UsersIcon,
  NetworkIcon,
} from '../components/ui/icons'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

/* Two small local icons so every nav item has its own icon.
   They match the stroke style of the shared icon set. */
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

function ListingsIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
      <circle cx="4" cy="6.5" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="17.5" r="1" />
    </svg>
  )
}

const getSupplierNavigation = (t: (key: string) => string) => [
  { label: t('nav.overview'), to: '/supplier', icon: OverviewIcon, end: true },
  { label: t('nav.listings'), to: '/supplier/listings', icon: ListingsIcon },
  { label: t('nav.requests'), to: '/supplier/requests', icon: UsersIcon },
  { label: t('nav.matches'), to: '/supplier/matches', icon: NetworkIcon },
  { label: t('nav.shopSetup'), to: '/supplier/shop-setup', icon: StoreIcon },
]

// Lets links inside the mobile drawer close it, without passing props around.
const CloseMenuContext = createContext(() => {})

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2'

function NavItems({ navigation }: { navigation: ReturnType<typeof getSupplierNavigation> }) {
  const onNavigate = useContext(CloseMenuContext)

  return (
    <ul className="space-y-1">
      {navigation.map(({ label, to, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
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

function BusinessCard({ shopName }: { shopName: string }) {
  const onNavigate = useContext(CloseMenuContext)

  return (
    <div className="rounded-2xl border border-forest/10 bg-[#f7faf6] p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint/60 text-forest-deeper">
          <StoreIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-forest-deeper">
            Your business
          </p>
          <p
            className="truncate text-xs text-stone"
            title={shopName}
          >
            {shopName || 'Shop profile'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-stone">
        Keep your listings and availability up to date so buyers can find your
        products.
      </p>

      <NavLink
        to="/supplier/listings"
        onClick={onNavigate}
        className={`mt-3 block rounded-xl bg-forest px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-forest-deeper ${focusRing}`}
      >
        Update listings
      </NavLink>
    </div>
  )
}

export default function SupplierLayout() {
  const cachedUser = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const [identity, setIdentity] = useState({ name: cachedUser?.full_name ?? '', shopName: '', phone: '', email: '' })
  const initialUserName = cachedUser?.full_name
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState<string | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    let active = true
    void Promise.all([fetchMe(), fetchSupplierProfile()]).then(([user, shop]) => {
      if (!active) return
      setUser(user)
      setIdentity({ name: user.full_name, shopName: shop.company_name, phone: user.phone, email: user.email ?? '' })
    }).catch(() => {
      if (active && initialUserName) setIdentity((current) => ({ ...current, name: initialUserName }))
    })
    return () => { active = false }
  }, [initialUserName, setUser])

  // Close the drawer when the route changes. Adjusting state while rendering
  // (instead of in an effect) avoids an extra render pass.
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setMobileMenuOpen(false)
  }

  const { t } = useTranslation()
  const navigation = getSupplierNavigation(t)

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const handleLogout = async () => {
    try { if (refreshToken) await invalidateRefreshToken(refreshToken) }
    catch { /* Local logout still closes this session if the network is unavailable. */ }
    finally { logout() }
  }

  const currentPage =
    navigation.find(({ to, end }) =>
      end ? pathname === to : pathname.startsWith(to),
    )?.label ?? 'Supplier'

  // Close with Escape and stop the page behind the drawer from scrolling.
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

  return (
    <div className="min-h-screen bg-[#f7faf6] text-stone-dark">
      <a
        href="#supplier-main"
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
              aria-controls="supplier-mobile-nav"
              className={`grid size-10 shrink-0 place-items-center rounded-xl border border-forest/15 text-forest transition-colors hover:bg-mint/40 lg:hidden ${focusRing}`}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="size-5" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </button>

            <NavLink
              to="/supplier"
              aria-label="Azmera Pay home"
              className={`flex min-w-0 items-center rounded-lg ${focusRing}`}
            >
              <img
                src="/images/logo.png"
                alt="Azmera Pay"
                className="h-9 w-auto object-contain sm:h-10"
              />
            </NavLink>

            {/* Current page name, so people always know where they are */}
            <div className="hidden items-center gap-3 md:flex" aria-hidden="true">
              <span className="h-6 w-px bg-forest/15" />
              <span className="text-sm font-medium text-stone">
                {currentPage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <div className="flex min-w-0 items-center gap-2.5 rounded-full border border-forest/10 bg-[#f7faf6] py-1 pl-1 pr-1 sm:pl-4 sm:pr-1">
              <div className="hidden min-w-0 text-right sm:block">
                <p
                  className="max-w-[180px] truncate text-sm font-semibold leading-5 text-forest-deeper"
                  title={identity.name || 'Supplier account'}
                >
                  {identity.name || 'Supplier account'}
                </p>
                <p
                  className="max-w-[220px] truncate text-xs leading-4 text-stone"
                  title={identity.shopName || 'Shop profile'}
                >
                  {identity.shopName || 'Shop profile'}
                </p>
              </div>

              <div
                role="img"
                aria-label={`${identity.name || 'Supplier account'}, ${identity.shopName || 'Shop profile'}`}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-mint/60 text-sm font-semibold text-forest-deeper ring-2 ring-white"
              >
                {getInitials(identity.name) || 'S'}
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className={`ml-1 rounded-lg px-3 py-2 text-xs font-semibold text-forest hover:bg-mint/50 ${focusRing}`}
                aria-label={t('nav.signOut')}
              >
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[208px] shrink-0 flex-col border-r border-forest/10 bg-white px-3 py-6 lg:flex">
          <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-stone/75">
            {t('nav.agentWorkspace')}
          </p>

          <nav aria-label="Supplier navigation">
            <NavItems navigation={navigation} />
          </nav>

          <div className="mt-auto">
            <BusinessCard shopName={identity.shopName} />
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={`mt-3 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm font-semibold text-forest ${focusRing}`}
            >
              {t('nav.signOut')}
            </button>
          </div>
        </aside>

        {/* Mobile drawer backdrop */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className={`fixed inset-0 top-[68px] z-30 bg-stone-dark/30 backdrop-blur-sm transition-[opacity,visibility] duration-200 motion-reduce:transition-none lg:hidden ${
            mobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
        />

        {/* Mobile drawer */}
        <aside
          id="supplier-mobile-nav"
          className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[min(300px,85vw)] flex-col border-r border-forest/10 bg-white px-3 py-5 shadow-xl transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:hidden ${
            mobileMenuOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
          }`}
        >
          <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-stone/75">
            {t('nav.agentWorkspace')}
          </p>

          <CloseMenuContext.Provider value={closeMobileMenu}>
            <nav aria-label="Mobile supplier navigation">
              <NavItems navigation={navigation} />
            </nav>

            <div className="mt-auto">
              <BusinessCard shopName={identity.shopName} />
              <button
                type="button"
                onClick={() => void handleLogout()}
                className={`mt-3 w-full rounded-xl border border-forest/15 px-3 py-2.5 text-sm font-semibold text-forest ${focusRing}`}
              >
                {t('nav.signOut')}
              </button>
            </div>
          </CloseMenuContext.Provider>
        </aside>

        <main
          id="supplier-main"
          className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
