import type { ReactNode } from 'react'
import clsx from 'clsx'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={clsx(
        'panel-soft group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-[#9ddaf2] hover:bg-white',
        className,
      )}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#c7eefc] blur-3xl transition duration-500 group-hover:bg-[#a7e4f8]" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f8ff] text-[#008ecc]">
        {icon}
      </div>

      <h3 className="relative mt-6 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
        {title}
      </h3>
      <p className="relative mt-3 text-sm leading-7 text-slate-500">
        {description}
      </p>
    </article>
  )
}
