import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
CloseIcon,
MenuIcon,
StoreIcon,
UsersIcon,
NetworkIcon,
ShieldIcon,
} from '../components/ui/icons'

const navigation = [
{ label: 'Overview', to: '/supplier', icon: StoreIcon, end: true },
{ label: 'My Listings', to: '/supplier/listings', icon: StoreIcon },
{ label: 'Requests', to: '/supplier/requests', icon: UsersIcon },
{ label: 'Matches', to: '/supplier/matches', icon: NetworkIcon },
]

export default function SupplierLayout() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const closeMobileMenu = () => setMobileMenuOpen(false)

return ( <div className="min-h-screen bg-[#f7faf6] text-stone-dark"> <a
     href="#supplier-main"
     className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
   >
Skip to content </a>


  <header className="sticky top-0 z-40 border-b border-forest/10 bg-white/95 backdrop-blur-md">
    <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
          className="grid size-10 place-items-center rounded-xl border border-forest/15 text-forest lg:hidden"
        >
          {mobileMenuOpen ? (
            <CloseIcon className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </button>

        <NavLink to="/supplier" className="flex items-center">
          <img
            src="/images/logo.png"
            alt="Azmera Pay"
            className="h-10 w-auto object-contain sm:h-12"
          />
        </NavLink>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-forest-deeper">
            Supplier Workspace
          </p>
          <p className="text-xs text-stone">
            Manage your agricultural listings
          </p>
        </div>

        <div className="grid size-10 place-items-center rounded-full bg-mint/60 text-forest-deeper">
          <ShieldIcon className="size-5" />
        </div>
      </div>
    </div>
  </header>

  <div className="mx-auto flex max-w-[1600px]">
    <aside className="sticky top-[76px] hidden h-[calc(100vh-76px)] w-64 shrink-0 flex-col border-r border-forest/10 bg-white px-4 py-7 lg:flex">
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone/75">
        Workspace
      </p>

      <nav aria-label="Supplier navigation" className="space-y-1.5">
        {navigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-stone-dark hover:bg-mint/40 hover:text-forest-deeper'
              }`
            }
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-forest/10 bg-[#f7faf6] p-4">
        <div className="mb-2 flex items-center gap-2 text-forest-deeper">
          <StoreIcon className="size-5" />
          <span className="text-sm font-semibold">Your business</span>
        </div>
        <p className="text-xs leading-5 text-stone">
          Keep your listings and availability up to date so buyers can find your products.
        </p>
      </div>
    </aside>

    {mobileMenuOpen && (
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeMobileMenu}
        className="fixed inset-0 top-[76px] z-30 bg-stone-dark/30 lg:hidden"
      />
    )}

    <aside
      className={`fixed bottom-0 left-0 top-[76px] z-40 w-72 border-r border-forest/10 bg-white px-4 py-6 transition-transform duration-200 lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone/75">
        Workspace
      </p>

      <nav aria-label="Mobile supplier navigation" className="space-y-1.5">
        {navigation.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-forest text-white'
                  : 'text-stone-dark hover:bg-mint/40 hover:text-forest-deeper'
              }`
            }
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>

    <main
      id="supplier-main"
      className="min-w-0 flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-10"
    >
      <Outlet />
    </main>
  </div>
</div>


)
}
