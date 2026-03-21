import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'

interface AdminSearchFilterBarProps {
  title?: string
  description?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
}

export function AdminSearchFilterBar({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
}: AdminSearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[26px] border border-[#eee6df] bg-[#fbfaf8] p-5">
      {title || description ? (
        <div>
          {title ? <h3 className="font-display text-lg font-semibold tracking-[-0.03em] text-slate-900">{title}</h3> : null}
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={searchPlaceholder}
              className="pl-11"
            />
          </label>
          {filters ? <div className="flex flex-1 flex-wrap items-center gap-3">{filters}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
