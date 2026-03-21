import type { ReactNode } from 'react'
import { Card, CardContent } from '../ui/card'

interface AdminSummaryCardProps {
  title: string
  value: string
  icon?: ReactNode
  description?: string
}

export function AdminSummaryCard({
  title,
  value,
  icon,
  description,
}: AdminSummaryCardProps) {
  return (
    <Card className="bg-[#fbfaf8]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              {value}
            </p>
            {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
          </div>
          {icon ? <div className="rounded-2xl bg-white p-3 text-[#c2410c] shadow-sm">{icon}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}
