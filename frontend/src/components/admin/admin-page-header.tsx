import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="inline-flex rounded-full bg-[#fff4ed] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c2410c]">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900 md:text-[2.2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
