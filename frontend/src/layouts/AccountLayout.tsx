import { LogOut, PackageSearch, RefreshCcw, UserCircle } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/cn'

export default function AccountLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-[280px]">
          <div className="overflow-hidden rounded-[24px] border border-[#d8edf6] bg-white">
            <div className="border-b border-[#f1f8fc] bg-[#f8fdff] p-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#008ecc] text-2xl font-bold text-white shadow-md">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="mt-3 font-semibold text-slate-900">{user.fullName}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            
            <nav className="flex flex-col p-2">
              <NavLink
                to="/account/profile"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#e8f8ff] text-[#008ecc]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <UserCircle className="h-5 w-5" />
                Thông tin tài khoản
              </NavLink>

              <NavLink
                to="/account/orders"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#e8f8ff] text-[#008ecc]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <PackageSearch className="h-5 w-5" />
                Quản lý đơn hàng
              </NavLink>

              <NavLink
                to="/account/returns"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#e8f8ff] text-[#008ecc]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <RefreshCcw className="h-5 w-5" />
                Bảo hành & Đổi trả
              </NavLink>

              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#dc2626] transition-colors hover:bg-[#fef2f2]"
              >
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
