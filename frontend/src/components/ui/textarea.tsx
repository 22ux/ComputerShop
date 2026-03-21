import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[120px] w-full rounded-xl border border-[#e8e3dc] bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#fdba74] focus:ring-4 focus:ring-[#ffedd5] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}
