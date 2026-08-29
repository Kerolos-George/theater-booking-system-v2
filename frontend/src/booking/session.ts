export function getSectionSlug(): string {
  return sessionStorage.getItem('selectedSection') || 'ground'
}

export function getSectionId(): string | null {
  return sessionStorage.getItem('selectedSectionId')
}

export function setSection(slug: string, id: string): void {
  sessionStorage.setItem('selectedSection', slug)
  sessionStorage.setItem('selectedSectionId', id)
}

import { sortSeatLabels } from './utils'

export function getSelectedSeats(): string[] {
  try {
    const raw = sessionStorage.getItem('selectedSeats')
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? sortSeatLabels(parsed.filter((s): s is string => typeof s === 'string'))
      : []
  } catch {
    return []
  }
}

export function setSelectedSeats(seats: string[]): void {
  sessionStorage.setItem('selectedSeats', JSON.stringify(sortSeatLabels(seats)))
}

export function getActiveBookingId(): string | null {
  return sessionStorage.getItem('activeBookingId')
}

export function setActiveBooking(id: string, ref: string): void {
  sessionStorage.setItem('activeBookingId', id)
  sessionStorage.setItem('activeBookingRef', ref)
}

export function getActiveBookingRef(): string | null {
  return sessionStorage.getItem('activeBookingRef')
}
