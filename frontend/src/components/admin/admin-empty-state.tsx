import type { ReactNode } from 'react'
import { Inbox, SearchX } from 'lucide-react'
import { Card, CardContent } from '../ui/card'

interface AdminEmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  icon?: 'inbox' | 'search'
}

export function AdminEmptyState({
  title,
  description,
  action,
  icon = 'inbox',
}: AdminEmptyStateProps) {
  const Icon = icon === 'search' ? SearchX : Inbox

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-8 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4ed] text-[#c2410c]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
