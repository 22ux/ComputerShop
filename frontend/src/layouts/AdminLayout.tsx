import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '../components/admin/admin-sidebar'
import { AdminTopbar } from '../components/admin/admin-topbar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-shell min-h-screen bg-[#f5f7fb] px-4 py-4 text-slate-900 sm:px-6 lg:px-8">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm xl:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="h-full max-w-[320px] p-4" onClick={(event) => event.stopPropagation()}>
            <AdminSidebar
              mobile
              className="h-full"
              onClose={() => setSidebarOpen(false)}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1600px] gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar className="hidden xl:block" />

        <div className="space-y-5">
          <AdminTopbar onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="space-y-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
