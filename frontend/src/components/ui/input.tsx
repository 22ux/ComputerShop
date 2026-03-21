import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-[#e8e3dc] bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#fdba74] focus:ring-4 focus:ring-[#ffedd5] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}
