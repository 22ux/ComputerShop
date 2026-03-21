import { ChevronRight, Store, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { adminNavigation } from './admin-nav'
import { cn } from '../../lib/cn'
import { Button } from '../ui/button'

interface AdminSidebarProps {
  className?: string
  onNavigate?: () => void
  onClose?: () => void
  mobile?: boolean
}

export function AdminSidebar({
  className,
  onNavigate,
  onClose,
  mobile = false,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'rounded-[30px] border border-white/60 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 rounded-[26px] bg-gradient-to-br from-[#fff7ed] to-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f97316] text-white shadow-[0_14px_28px_rgba(249,115,22,0.24)]">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-900">
              Seller Center
            </div>
            <div className="text-sm text-slate-500">Computer Store Admin</div>
          </div>
        </div>
        {mobile ? (
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4.5 w-4.5" />
          </Button>
        ) : null}
      </div>

      <nav className="mt-6 space-y-1.5">
        {adminNavigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all',
                  isActive
                    ? 'bg-[#fff1e8] text-[#c2410c] shadow-[inset_0_0_0_1px_rgba(249,115,22,0.12)]'
                    : 'text-slate-600 hover:bg-[#fcfaf8] hover:text-slate-900',
                )}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl transition-all',
                      isActive ? 'bg-white text-[#f97316]' : 'bg-[#f8fafc] text-slate-500 group-hover:bg-white',
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="truncate text-xs text-slate-400">{item.description}</div>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 transition', isActive ? 'text-[#f97316]' : 'text-slate-300')} />
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-6 rounded-[24px] border border-[#f1ebe5] bg-[#fcfaf8] p-4">
        <div className="text-sm font-semibold text-slate-900">Today&apos;s focus</div>
        <div className="mt-1 text-sm leading-6 text-slate-500">
          Review new orders, update low-stock items, and keep the catalog clean.
        </div>
      </div>
    </aside>
  )
}
