import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/30 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-[#f97316] text-white shadow-[0_14px_28px_rgba(249,115,22,0.24)] hover:bg-[#ea6a0c]',
        secondary: 'bg-[#fff4ed] text-[#c2410c] hover:bg-[#ffe7d8]',
        outline: 'border border-[#eadfd5] bg-white text-slate-700 hover:border-[#fdba74] hover:text-[#c2410c]',
        ghost: 'text-slate-600 hover:bg-[#fff4ed] hover:text-[#c2410c]',
        destructive: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-11 px-5 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
