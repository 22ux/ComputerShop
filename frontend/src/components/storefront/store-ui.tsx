import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronDown, PackageOpen } from 'lucide-react'
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { mapStatusTone } from '../../lib/utils'

const storeButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9e7fa] disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-[#008ecc] px-5 py-3 text-white shadow-[0_20px_40px_rgba(0,142,204,0.18)] hover:bg-[#0078ad]',
        secondary: 'border border-[#cdebf7] bg-white px-5 py-3 text-[#008ecc] hover:border-[#8ad4ef] hover:bg-[#f5fcff]',
        ghost: 'px-3 py-2 text-slate-600 hover:bg-[#eff9fd] hover:text-[#008ecc]',
        danger: 'bg-[#ef4444] px-5 py-3 text-white hover:bg-[#dc2626]',
      },
      size: {
        default: '',
        sm: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-[15px]',
        icon: 'h-11 w-11 rounded-2xl p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

interface StoreButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof storeButtonVariants> {
  asChild?: boolean
}

export function StoreButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: StoreButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(storeButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export function StoreInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-2xl border border-[#d8edf6] bg-white px-4 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.04)] outline-none transition focus:border-[#76d0f0] focus:ring-4 focus:ring-[#e2f6fd] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}

export function StoreTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[120px] w-full rounded-2xl border border-[#d8edf6] bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.04)] outline-none transition focus:border-[#76d0f0] focus:ring-4 focus:ring-[#e2f6fd] placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      )}
      {...props}
    />
  )
}

export function StoreSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-12 w-full appearance-none rounded-2xl border border-[#d8edf6] bg-white px-4 pr-10 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.04)] outline-none transition focus:border-[#76d0f0] focus:ring-4 focus:ring-[#e2f6fd] disabled:cursor-not-allowed disabled:bg-slate-100',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

export function StoreField({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-slate-800">{label}</div>
      {children}
      {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}

export function StorePageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="inline-flex rounded-full bg-[#e8f8ff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#008ecc]">
          {eyebrow}
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-5xl">
          {title}
        </h1>
        {description ? <p className="mt-4 text-base leading-8 text-slate-500">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

export function StoreEmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}) {
  return (
    <div className="rounded-[32px] border border-[#dceff7] bg-white px-8 py-14 text-center shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#e9f8ff] text-[#008ecc]">
        <PackageOpen className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-slate-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{description}</p>
      {actionLabel && actionTo ? (
        <div className="mt-6">
          <StoreButton asChild>
            <Link to={actionTo}>{actionLabel}</Link>
          </StoreButton>
        </div>
      ) : null}
    </div>
  )
}

export function StoreStatusBadge({ status }: { status: string }) {
  const tone = mapStatusTone(status)

  const toneClass =
    tone === 'success'
      ? 'border-[#c8f1d9] bg-[#effcf4] text-[#15803d]'
      : tone === 'warning'
        ? 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
        : tone === 'danger'
          ? 'border-[#fecaca] bg-[#fef2f2] text-[#dc2626]'
          : tone === 'info'
            ? 'border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]'
            : 'border-[#d8edf6] bg-[#f7fbfd] text-slate-600'

  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', toneClass)}>
      {status}
    </span>
  )
}

export function StoreSurface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[32px] border border-[#dceff7] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]',
        className,
      )}
      {...props}
    />
  )
}
