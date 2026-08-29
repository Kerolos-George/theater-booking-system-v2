export interface AuthUser {
  id: string
  name: string
  mobile: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface Section {
  id: string
  type: string
  slug: string
  labelAr: string
  visible: boolean
  price: number
}

export interface TheaterRow {
  id: string
  rowCode: string
  groupLetter: string
  side: string
  startNumber: number
  endNumber: number
  sortOrder: number
  visible: boolean
}

export interface ApiSeat {
  id: string
  label: string
  rowCode: string
  number: number
  status: 'available' | 'booked' | 'hidden'
}

export interface SeatMapResponse {
  rows: TheaterRow[]
  seats: ApiSeat[]
}

export interface BookingSeat {
  label: string
  attendeeName: string
}

export type ApiBookingStatus = 'UNPAID' | 'PENDING' | 'CONFIRMED' | 'CANCELED'

export interface Booking {
  id: string
  ref: string
  status: ApiBookingStatus
  section: {
    id: string
    type: string
    slug: string
    labelAr: string
    price: number
  }
  contactName: string
  whatsapp: string
  paymentProofUrl: string | null
  entryCode: string | null
  totalAmount: number
  seats: BookingSeat[]
  createdAt: string
  updatedAt: string
  paymentProcessing?: boolean
}

export interface CreateBookingPayload {
  sectionId: string
  contactName: string
  whatsapp: string
  seats: BookingSeat[]
}

export interface BookedSeatsError {
  message: string
  bookedSeats?: string[]
}
