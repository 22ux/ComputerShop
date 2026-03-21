import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

interface AdminSectionCardProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  contentClassName?: string
}

export function AdminSectionCard({
  title,
  description,
  actions,
  children,
  contentClassName,
}: AdminSectionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}
