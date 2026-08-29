import { apiRequest } from './http'
import type { SeatMapResponse, Section } from './types'

export function fetchSections(): Promise<Section[]> {
  return apiRequest<Section[]>('/user/sections', { auth: true })
}

export function fetchSeatMap(sectionId: string): Promise<SeatMapResponse> {
  return apiRequest<SeatMapResponse>(`/user/sections/${sectionId}/seats`, { auth: true })
}
