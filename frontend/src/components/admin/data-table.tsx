import type { ReactNode } from 'react'
import { AdminEmptyState } from './admin-empty-state'
import { Card } from '../ui/card'

interface DataTableProps {
  columns: ReactNode
  children: ReactNode
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  footer?: ReactNode
}

export function DataTable({
  columns,
  children,
  isEmpty = false,
  emptyTitle = 'No data available',
  emptyDescription = 'Try adjusting your filters or add a new item.',
  footer,
}: DataTableProps) {
  if (isEmpty) {
    return (
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#fcfaf8] text-left">
            {columns}
          </thead>
          <tbody className="divide-y divide-[#f1ebe5] bg-white">{children}</tbody>
        </table>
      </div>
      {footer ? <div className="border-t border-[#f1ebe5] px-6 py-4">{footer}</div> : null}
    </Card>
  )
}
