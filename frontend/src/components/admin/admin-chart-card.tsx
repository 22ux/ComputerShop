import type { ReactNode } from 'react'
import { AdminSectionCard } from './admin-section-card'

interface AdminChartCardProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminChartCard({
  title,
  description,
  actions,
  children,
}: AdminChartCardProps) {
  return (
    <AdminSectionCard
      title={title}
      description={description}
      actions={actions}
      contentClassName="pt-2"
    >
      {children}
    </AdminSectionCard>
  )
}
