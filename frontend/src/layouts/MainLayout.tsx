import { Gift, LayoutDashboard, MapPin, Search, ShoppingCart, Truck, User } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { Category } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { StoreButton, StoreInput } from '../components/storefront/store-ui'
import { cn } from '../lib/cn'
import http from '../lib/http'

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isAdmin, logout, user } = useAuth()
  const { cart } = useCart()
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const navItems = [
    { to: '/', label: 'Home', show: true },
    { to: '/products', label: 'Catalog', show: true },
  ].filter((item) => item.show)

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchTerm.trim()
    navigate(query ? `/products?searchTerm=${encodeURIComponent(query)}` : '/products')
  }

  const categoryId = new URLSearchParams(location.search).get('categoryId')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await http.get<Category[]>('/categories')
        setCategories(data)
      } catch {
        setCategories([])
      }
    }

    void loadCategories()
  }, [])

  useEffect(() => {
    const nextSearch = location.pathname === '/products'
      ? new URLSearchParams(location.search).get('searchTerm') ?? ''
      : ''

    setSearchTerm(nextSearch)
  }, [location.pathname, location.search])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3fbff_0%,#f8fcff_100%)] text-slate-900">
      <header className="sticky top-0 z-50 backdrop-blur">
        <div className="border-b border-[#d8edf6] bg-[#008ecc] text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
            <div className="font-medium">Welcome to ComputerStore.</div>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Deliver nationwide
              </div>
              <div className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Track your order
              </div>
              <div className="inline-flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Daily deals
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#d8edf6] bg-white/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link to="/" className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#008ecc] text-2xl font-bold text-white shadow-[0_18px_35px_rgba(0,142,204,0.22)]">
                C
              </div>
              <div>
                <div className="font-display text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  ComputerStore
                </div>
                <div className="text-sm text-slate-500">Modern hardware marketplace</div>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="relative flex-1 lg:max-w-[520px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <StoreInput
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search laptops, monitors, accessories..."
                className="pl-11 pr-28"
              />
              <StoreButton type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2.5">
                Search
              </StoreButton>
            </form>

            <div className="flex flex-wrap items-center gap-3">
              {isAdmin ? (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f3fbff] border border-[#d8edf6] px-4 py-2.5 text-sm font-semibold text-[#008ecc] transition hover:border-[#9ddaf2] hover:bg-[#e8f8ff]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}

              <Link
                to="/cart"
                className="inline-flex items-center gap-2 rounded-full border border-[#d8edf6] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#9ddaf2] hover:text-[#008ecc]"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                <span className="rounded-full bg-[#e8f8ff] px-2 py-0.5 text-xs text-[#008ecc]">
                  {cart.itemCount}
                </span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/account" className="hidden items-center gap-2 rounded-full bg-[#eff9fd] px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#e8f8ff] hover:text-[#008ecc] md:inline-flex">
                    <User className="h-4 w-4 text-[#008ecc]" />
                    {user?.fullName ?? 'Account'}
                  </Link>
                  <StoreButton variant="secondary" size="sm" onClick={logout}>
                    Sign out
                  </StoreButton>
                </>
              ) : (
                <>
                  <StoreButton asChild variant="secondary" size="sm">
                    <Link to="/login">Sign in</Link>
                  </StoreButton>
                  <StoreButton asChild size="sm">
                    <Link to="/register">Create account</Link>
                  </StoreButton>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-[#d8edf6] bg-white">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn('nav-pill gap-2 whitespace-nowrap', isActive && 'nav-pill-active')}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            {categories.length > 0 ? (
              <button
                type="button"
                onClick={() => navigate('/products')}
                className={cn('nav-pill whitespace-nowrap', location.pathname === '/products' && !categoryId && 'nav-pill-active')}
              >
                All products
              </button>
            ) : null}

            {categories.map((category) => {
              const active = location.pathname === '/products' && categoryId === String(category.id)

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigate(`/products?categoryId=${category.id}`)}
                  className={cn('nav-pill whitespace-nowrap', active && 'nav-pill-active')}
                >
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-[#d8edf6] bg-[#f0fbff]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-[32px] border border-[#dceff7] bg-white px-6 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.05)] lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#008ecc] text-lg font-bold text-white">C</div>
                <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">ComputerStore</div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                A cleaner ecommerce experience for gaming rigs, office laptops, creator setups, and serious accessories.
              </p>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Browse</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>
                <Link to="/cart">Cart</Link>
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Account</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
                {isAuthenticated ? <Link to="/account/profile">Profile</Link> : <Link to="/login">Sign in</Link>}
                {isAuthenticated ? <Link to="/account/orders">Orders</Link> : <Link to="/register">Register</Link>}
                {isAdmin ? <Link to="/admin/dashboard">Admin dashboard</Link> : null}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
