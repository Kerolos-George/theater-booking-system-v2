import { SEAT_PRICE } from './constants'

export type BookingStatus = 'unpaid' | 'pending' | 'confirmed'

export interface BookingDetails {
  fullName: string
  whatsapp: string
  attendees: Record<string, string>
}

export interface Booking {
  id: string
  userMobile: string
  sectionId: string
  seats: string[]
  details: BookingDetails
  total: number
  status: BookingStatus
  createdAt: string
  paymentProof?: string
  entryCode?: string
}

const BOOKINGS_KEY = 'userBookings'

function getAllBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Booking[]) : []
  } catch {
    return []
  }
}

function saveAllBookings(bookings: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

export function generateBookingRef(): string {
  return `PRM-${Math.floor(10000 + Math.random() * 89999)}`
}

export function getBookingById(id: string): Booking | undefined {
  return getAllBookings().find((b) => b.id === id)
}

export function getBookingsForUser(mobile: string): Booking[] {
  return getAllBookings()
    .filter((b) => b.userMobile === mobile)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function upsertUnpaidBooking(data: {
  id: string
  userMobile: string
  sectionId: string
  seats: string[]
  details: BookingDetails
}): Booking {
  const bookings = getAllBookings()
  const total = data.seats.length * SEAT_PRICE
  const existingIndex = bookings.findIndex((b) => b.id === data.id)

  const booking: Booking = {
    id: data.id,
    userMobile: data.userMobile,
    sectionId: data.sectionId,
    seats: data.seats,
    details: data.details,
    total,
    status: 'unpaid',
    createdAt: existingIndex >= 0 ? bookings[existingIndex].createdAt : new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    bookings[existingIndex] = booking
  } else {
    bookings.push(booking)
  }

  saveAllBookings(bookings)
  return booking
}

export function submitPaymentProof(id: string, paymentProof: string): { ok: boolean; error?: string } {
  const bookings = getAllBookings()
  const index = bookings.findIndex((b) => b.id === id)

  if (index < 0) {
    return { ok: false, error: 'لم يتم العثور على الحجز' }
  }

  if (bookings[index].status !== 'unpaid') {
    return { ok: false, error: 'تم رفع الدفع مسبقاً لهذا الحجز' }
  }

  bookings[index] = {
    ...bookings[index],
    status: 'pending',
    paymentProof,
  }
  saveAllBookings(bookings)
  return { ok: true }
}

/** For future admin use — marks booking confirmed with WhatsApp entry code */
export function confirmBooking(id: string, entryCode: string): void {
  const bookings = getAllBookings()
  const index = bookings.findIndex((b) => b.id === id)
  if (index < 0) return

  bookings[index] = {
    ...bookings[index],
    status: 'confirmed',
    entryCode,
  }
  saveAllBookings(bookings)
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  unpaid: 'غير مدفوع',
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
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

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
