export interface AdminUser {
  id: string
  email: string
  name: string
}

export interface AdminAuthResponse {
  accessToken: string
  admin: AdminUser
}

export type ApiBookingStatus = 'UNPAID' | 'PENDING' | 'CONFIRMED' | 'CANCELED'

export interface AdminBookingSeat {
  label: string
  attendeeName: string
}

export interface AdminBooking {
  id: string
  ref: string
  status: ApiBookingStatus
  contactName: string
  email: string
  whatsapp: string
  paymentProofUrl: string | null
  entryCode: string | null
  entryCodeUsed: boolean
  entryCodeUsedAt: string | null
  totalAmount: number
  section: {
    id: string
    type: string
    slug: string
    labelAr: string
    price: number
  }
  user: {
    id: string
    name: string
    mobile: string
  }
  seats: AdminBookingSeat[]
  createdAt: string
  updatedAt: string
}

export interface AdminPaginatedBookings {
  items: AdminBooking[]
  total: number
  page: number
  limit: number
  totalPages: number
}
