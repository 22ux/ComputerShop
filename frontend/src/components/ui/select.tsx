import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-11 w-full appearance-none rounded-xl border border-[#e8e3dc] bg-white px-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#fdba74] focus:ring-4 focus:ring-[#ffedd5] disabled:cursor-not-allowed disabled:bg-slate-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}
