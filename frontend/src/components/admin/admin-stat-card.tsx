import type { ReactNode } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { cn } from '../../lib/cn'

interface AdminStatCardProps {
  title: string
  value: string
  caption: string
  trend?: number
  icon: ReactNode
  tone?: 'orange' | 'blue' | 'green' | 'violet'
}

const toneClasses = {
  orange: 'bg-[#fff4ed] text-[#c2410c]',
  blue: 'bg-[#eff6ff] text-[#2563eb]',
  green: 'bg-[#effcf4] text-[#15803d]',
  violet: 'bg-[#f5f3ff] text-[#7c3aed]',
}

export function AdminStatCard({
  title,
  value,
  caption,
  trend,
  icon,
  tone = 'orange',
}: AdminStatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900">
              {value}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {typeof trend === 'number' ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                    trend >= 0 ? 'bg-[#effcf4] text-[#15803d]' : 'bg-[#fef2f2] text-[#dc2626]',
                  )}
                >
                  {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(trend)}%
                </span>
              ) : null}
              <span>{caption}</span>
            </div>
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', toneClasses[tone])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
