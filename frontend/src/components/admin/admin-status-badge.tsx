import { Badge } from '../ui/badge'
import { mapStatusTone } from '../../lib/utils'

export function AdminStatusBadge({ status }: { status: string }) {
  const tone = mapStatusTone(status)

  if (tone === 'success') {
    return <Badge variant="success">{status}</Badge>
  }

  if (tone === 'warning') {
    return <Badge variant="warning">{status}</Badge>
  }

  if (tone === 'danger') {
    return <Badge variant="danger">{status}</Badge>
  }

  if (tone === 'info') {
    return <Badge variant="info">{status}</Badge>
  }

  return <Badge variant="muted">{status}</Badge>
}
