import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, LogOut, Menu, Search, Store, UserCircle2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { adminNavigation, adminRouteMeta } from './admin-nav'
import { useAuth } from '../../contexts/AuthContext'

export function AdminTopbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [query, setQuery] = useState('')

  const routeMeta = useMemo(
    () =>
      adminRouteMeta[pathname] ?? {
        title: 'Admin workspace',
        description: 'Manage products, customers, and orders with a cleaner operations interface.',
      },
    [pathname],
  )

  const handleQuickSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = adminNavigation.find((item) =>
      [item.label, item.description, ...item.keywords].some((entry) =>
        entry.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    )

    if (!query.trim()) {
      return
    }

    if (!next) {
      toast.error('No matching admin workspace found.')
      return
    }

    navigate(next.to)
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/90 px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-3 xl:hidden">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ece6de] bg-white text-slate-600 transition hover:border-[#fdba74] hover:text-[#c2410c]"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="text-sm font-medium text-[#f97316]">Admin overview</div>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-slate-900">
          {routeMeta.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{routeMeta.description}</p>
      </div>

      <div className="flex flex-col gap-3 lg:w-[520px] lg:flex-row lg:items-center lg:justify-end">
        <form onSubmit={handleQuickSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Quick jump: dashboard, products, orders..."
            className="pl-11"
          />
        </form>

        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ece6de] bg-white text-slate-600 transition hover:text-[#c2410c]"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#f97316]" />
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-2xl border border-[#ece6de] bg-white px-3 py-2.5 text-left transition hover:border-[#fdba74]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff4ed] text-[#c2410c]">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div className="hidden min-w-0 sm:block">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {user?.fullName ?? 'Administrator'}
                </div>
                <div className="truncate text-xs text-slate-500">{user?.email}</div>
              </div>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={10}
              align="end"
              className="z-50 min-w-[220px] rounded-[24px] border border-[#ece6de] bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
            >
              <DropdownMenu.Item asChild>
                <Link to="/" className="flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-700 outline-none transition hover:bg-[#fff7ed]">
                  <Store className="h-4 w-4" />
                  View storefront
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => logout()}
                className="flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-[#dc2626] outline-none transition hover:bg-[#fef2f2]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  )
}
