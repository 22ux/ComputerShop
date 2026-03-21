import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StoreSurface } from './store-ui'

export function StoreAuthShell({
  eyebrow,
  title,
  description,
  benefits,
  stats,
  form,
  footerPrompt,
  footerActionLabel,
  footerActionTo,
}: {
  eyebrow: string
  title: string
  description: string
  benefits: Array<{ title: string; description: string }>
  stats?: Array<{ label: string; value: string }>
  form: ReactNode
  footerPrompt: string
  footerActionLabel: string
  footerActionTo: string
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_520px]">
      <StoreSurface className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="absolute -left-10 top-0 h-72 w-72 rounded-full bg-[#b9e7fa] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#dff6ff] blur-3xl" />
        <div className="relative">
          <div className="inline-flex rounded-full bg-[#e8f8ff] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#008ecc]">
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">{description}</p>

          {stats?.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[24px] border border-[#dceff7] bg-white/80 px-4 py-4 backdrop-blur">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{stat.label}</div>
                  <div className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="rounded-[28px] border border-[#dceff7] bg-white/80 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f8ff] text-sm font-semibold text-[#008ecc]">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{benefit.title}</div>
                    <div className="mt-1 text-sm leading-7 text-slate-500">{benefit.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </StoreSurface>

      <div className="space-y-4">
        <StoreSurface className="p-6 sm:p-8">{form}</StoreSurface>
        <StoreSurface className="p-5">
          <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{footerPrompt}</span>
            <Link to={footerActionTo} className="inline-flex items-center gap-2 font-semibold text-[#008ecc] transition hover:text-[#0072a5]">
              {footerActionLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </StoreSurface>
      </div>
    </div>
  )
}
