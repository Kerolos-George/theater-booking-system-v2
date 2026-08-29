import type { ApiBookingStatus, Booking } from '../api/types'

export type BookingStatus = 'unpaid' | 'pending' | 'confirmed' | 'canceled'

export const STATUS_LABELS: Record<BookingStatus, string> = {
  unpaid: 'غير مدفوع',
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  canceled: 'ملغي',
}

export function normalizeStatus(status: ApiBookingStatus | string): BookingStatus {
  return status.toLowerCase() as BookingStatus
}

/** Sort seat labels alphabetically by row (AL, AR, PL…) then by seat number (1, 2, 11…) */
export function sortSeatLabels(labels: string[]): string[] {
  return [...labels].sort(compareSeatLabels)
}

export function compareSeatLabels(a: string, b: string): number {
  const parse = (label: string): { row: string; num: number } => {
    const match = label.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/)
    if (!match) return { row: label.toUpperCase(), num: 0 }
    return { row: match[1], num: Number(match[2]) }
  }

  const left = parse(a)
  const right = parse(b)
  const rowOrder = left.row.localeCompare(right.row)
  if (rowOrder !== 0) return rowOrder
  return left.num - right.num
}

export function formatBookingDate(iso: string): string {
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(iso))
}

export function bookingSeatLabels(booking: Booking): string[] {
  return sortSeatLabels(booking.seats.map((s) => s.label))
}

export function bookingAttendees(booking: Booking): Record<string, string> {
  return Object.fromEntries(booking.seats.map((s) => [s.label, s.attendeeName]))
}
