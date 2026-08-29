import { apiRequest, ApiError } from './http'
import { withRetry, sleep } from './retry'
import type { Booking, CreateBookingPayload } from './types'

export function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return apiRequest<Booking>('/user/bookings', {
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export function fetchMyBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>('/user/bookings', { auth: true })
}

export function fetchBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/user/bookings/${id}`, { auth: true })
}

async function uploadPaymentProofOnce(bookingId: string, file: File): Promise<Booking> {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<Booking>(`/user/bookings/${bookingId}/payment`, {
    method: 'POST',
    auth: true,
    body: formData,
  })
}

async function waitForPaymentActivation(bookingId: string): Promise<Booking> {
  for (let attempt = 0; attempt < 20; attempt++) {
    await sleep(1500)
    const booking = await fetchBooking(bookingId)

    if (booking.status === 'PENDING' || booking.status === 'CONFIRMED') {
      return booking
    }

    if (!booking.paymentProcessing) {
      return booking
    }
  }

  throw new ApiError(
    408,
    null,
    'تم استلام الصورة وجاري تفعيلها. تحقق من حجوزاتي خلال دقائق',
  )
}

export async function uploadPaymentProof(bookingId: string, file: File): Promise<Booking> {
  const booking = await withRetry(() => uploadPaymentProofOnce(bookingId, file), {
    attempts: 3,
    delayMs: 1000,
  })

  if (booking.paymentProcessing) {
    return waitForPaymentActivation(bookingId)
  }

  return booking
}
