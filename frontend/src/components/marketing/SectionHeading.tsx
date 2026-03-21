import clsx from 'clsx'
import type { ReactNode } from 'react'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  className?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <div className={clsx('flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="max-w-3xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">
          {description}
        </p>
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
