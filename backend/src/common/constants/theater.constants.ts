export const MAX_SEATS_PER_BOOKING = 11;
export const DEFAULT_SEAT_PRICE = 75;
/** Booking 11 seats charges for 10 (one free). */
export const FULL_PACKAGE_SEATS = 11;
export const FULL_PACKAGE_BILLABLE_SEATS = 10;

export function billableSeatCount(seatCount: number): number {
  if (seatCount >= FULL_PACKAGE_SEATS) {
    return FULL_PACKAGE_BILLABLE_SEATS;
  }
  return seatCount;
}

export function calculateBookingTotal(seatCount: number, pricePerSeat: number): number {
  return billableSeatCount(seatCount) * pricePerSeat;
}

export const SECTION_TYPE_MAP = {
  ground: 'GROUND',
  balcony: 'BALCONY',
} as const;

export const SECTION_TYPE_REVERSE: Record<string, string> = {
  GROUND: 'ground',
  BALCONY: 'balcony',
};
