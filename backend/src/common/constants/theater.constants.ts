export const MAX_SEATS_PER_BOOKING = 5;
export const DEFAULT_SEAT_PRICE = 60;

export const SECTION_TYPE_MAP = {
  ground: 'GROUND',
  balcony: 'BALCONY',
} as const;

export const SECTION_TYPE_REVERSE: Record<string, string> = {
  GROUND: 'ground',
  BALCONY: 'balcony',
};
