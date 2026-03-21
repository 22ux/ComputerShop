import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export function AdminLoadingSkeleton({
  title = true,
  rows = 5,
}: {
  title?: boolean
  rows?: number
}) {
  return (
    <Card>
      {title ? (
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
      ) : null}
      <CardContent className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
