import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'border-[#fdba74] bg-[#fff4ed] text-[#c2410c]',
        muted: 'border-[#e8eaf0] bg-[#f8fafc] text-slate-600',
        success: 'border-[#c8f1d9] bg-[#effcf4] text-[#15803d]',
        warning: 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]',
        danger: 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]',
        info: 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
