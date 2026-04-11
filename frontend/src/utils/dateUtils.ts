import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns'

export const formatDate = (date: string) =>
  format(parseISO(date), 'MMM d, yyyy')

export const formatDateTime = (date: string) =>
  format(parseISO(date), 'MMM d, yyyy h:mm a')

export const formatTime = (date: string) =>
  format(parseISO(date), 'h:mm a')

export const timeAgo = (date: string) =>
  formatDistanceToNow(parseISO(date), { addSuffix: true })

export const formatHours = (hours: number) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const minutesToHours = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const getCurrentPeriod = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    label: format(now, 'MMMM yyyy'),
  }
}

export const elapsedTime = (from: string): string => {
  const mins = differenceInMinutes(new Date(), parseISO(from))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
