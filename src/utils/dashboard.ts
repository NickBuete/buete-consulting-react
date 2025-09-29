// Dashboard utility functions and constants

export const formatDate = (value: string | null) => {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  } catch (error) {
    return value
  }
}

export const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  PENDING: 'outline',
  ACCEPTED: 'secondary',
  SCHEDULED: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CLAIMED: 'default',
  CANCELLED: 'destructive',
}
