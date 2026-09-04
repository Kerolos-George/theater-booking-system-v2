export const SEAT_PRICE = 75
export const MAX_SEATS = 11
/** Booking 11 seats charges for 10 (one free). */
export const FULL_PACKAGE_SEATS = 11
export const FULL_PACKAGE_BILLABLE_SEATS = 10

export function billableSeatCount(seatCount: number): number {
  if (seatCount >= FULL_PACKAGE_SEATS) {
    return FULL_PACKAGE_BILLABLE_SEATS
  }
  return seatCount
}

export function calculateBookingTotal(seatCount: number, pricePerSeat = SEAT_PRICE): number {
  return billableSeatCount(seatCount) * pricePerSeat
}

export const SECTION_LABELS: Record<string, string> = {
  ground: 'الدور الأرضي',
  balcony: 'البالكون',
}

export const INSTAPAY = {
  address: 'theater.premiere@instapay',
  number: '01012345678',
  ownerName: 'بريميير ثياتر',
} as const
