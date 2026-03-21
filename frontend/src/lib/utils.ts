import axios from 'axios'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred.'
}

export function mapStatusTone(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
      return 'success'
    case 'pending':
    case 'shipping':
      return 'warning'
    case 'locked':
    case 'inactive':
    case 'cancelled':
      return 'danger'
    case 'confirmed':
      return 'info'
    default:
      return 'muted'
  }
}
