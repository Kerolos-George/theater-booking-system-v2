export interface RowBlockDefinition {
  rowCode: string
  side: 'L' | 'R'
  startNumber: number
  endNumber: number
  visible?: boolean
}

export interface RowGroupDefinition {
  groupLetter: string
  sortOrder: number
  left?: RowBlockDefinition
  right?: RowBlockDefinition
}

export interface SectionLayoutDefinition {
  rowGroups: RowGroupDefinition[]
}

/** Ground floor — A → P (alphabetical rows: AL/AR, BL/BR, …) */
export const GROUND_LAYOUT: SectionLayoutDefinition = {
  rowGroups: [
    { groupLetter: 'A', sortOrder: 0, left: { rowCode: 'AL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'AR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'B', sortOrder: 1, left: { rowCode: 'BL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'BR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'C', sortOrder: 2, left: { rowCode: 'CL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'CR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'D', sortOrder: 3, left: { rowCode: 'DL', side: 'L', startNumber: 1, endNumber: 10 }, right: { rowCode: 'DR', side: 'R', startNumber: 1, endNumber: 9 } },
    { groupLetter: 'E', sortOrder: 4, left: { rowCode: 'EL', side: 'L', startNumber: 1, endNumber: 10 }, right: { rowCode: 'ER', side: 'R', startNumber: 1, endNumber: 10 } },
    { groupLetter: 'F', sortOrder: 5, left: { rowCode: 'FL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'FR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'G', sortOrder: 6, left: { rowCode: 'GL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'GR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'H', sortOrder: 7, left: { rowCode: 'HL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'HR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'I', sortOrder: 8, left: { rowCode: 'IL', side: 'L', startNumber: 1, endNumber: 10 }, right: { rowCode: 'IR', side: 'R', startNumber: 1, endNumber: 9 } },
    { groupLetter: 'J', sortOrder: 9, left: { rowCode: 'JL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'JR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'K', sortOrder: 10, left: { rowCode: 'KL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'KR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'L', sortOrder: 11, left: { rowCode: 'LL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'LR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'M', sortOrder: 12, left: { rowCode: 'ML', side: 'L', startNumber: 1, endNumber: 9 }, right: { rowCode: 'MR', side: 'R', startNumber: 1, endNumber: 9 } },
    { groupLetter: 'N', sortOrder: 13, left: { rowCode: 'NL', side: 'L', startNumber: 1, endNumber: 10 }, right: { rowCode: 'NR', side: 'R', startNumber: 1, endNumber: 10 } },
    { groupLetter: 'O', sortOrder: 14, left: { rowCode: 'OL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'OR', side: 'R', startNumber: 4, endNumber: 11 } },
    { groupLetter: 'P', sortOrder: 15, left: { rowCode: 'PL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'PR', side: 'R', startNumber: 4, endNumber: 11 } },
  ],
}

export const BALCONY_LAYOUT: SectionLayoutDefinition = {
  rowGroups: [
    { groupLetter: 'A', sortOrder: 0, left: { rowCode: 'AL', side: 'L', startNumber: 1, endNumber: 11 }, right: { rowCode: 'AR', side: 'R', startNumber: 1, endNumber: 11 } },
    { groupLetter: 'B', sortOrder: 1, left: { rowCode: 'BL', side: 'L', startNumber: 1, endNumber: 12 }, right: { rowCode: 'BR', side: 'R', startNumber: 1, endNumber: 12 } },
    { groupLetter: 'C', sortOrder: 2, left: { rowCode: 'CL', side: 'L', startNumber: 1, endNumber: 7 }, right: { rowCode: 'CR', side: 'R', startNumber: 1, endNumber: 7 } },
    { groupLetter: 'D', sortOrder: 3, left: { rowCode: 'DL', side: 'L', startNumber: 1, endNumber: 7 }, right: { rowCode: 'DR', side: 'R', startNumber: 1, endNumber: 7 } },
    { groupLetter: 'E', sortOrder: 4, left: { rowCode: 'EL', side: 'L', startNumber: 1, endNumber: 8 }, right: { rowCode: 'ER', side: 'R', startNumber: 1, endNumber: 8 } },
    { groupLetter: 'F', sortOrder: 5, left: { rowCode: 'FL', side: 'L', startNumber: 1, endNumber: 8 }, right: { rowCode: 'FR', side: 'R', startNumber: 1, endNumber: 9 } },
    { groupLetter: 'G', sortOrder: 6, left: { rowCode: 'GL', side: 'L', startNumber: 1, endNumber: 9 }, right: { rowCode: 'GR', side: 'R', startNumber: 1, endNumber: 9 } },
    { groupLetter: 'H', sortOrder: 7, left: { rowCode: 'HL', side: 'L', startNumber: 1, endNumber: 7 }, right: { rowCode: 'HR', side: 'R', startNumber: 1, endNumber: 7 } },
    { groupLetter: 'I', sortOrder: 8, left: { rowCode: 'IL', side: 'L', startNumber: 1, endNumber: 5 }, right: { rowCode: 'IR', side: 'R', startNumber: 1, endNumber: 5 } },
    { groupLetter: 'J', sortOrder: 9, left: { rowCode: 'JL', side: 'L', startNumber: 1, endNumber: 5 }, right: { rowCode: 'JR', side: 'R', startNumber: 1, endNumber: 4 } },
    { groupLetter: 'K', sortOrder: 10, left: { rowCode: 'KL', side: 'L', startNumber: 1, endNumber: 5 }, right: { rowCode: 'KR', side: 'R', startNumber: 1, endNumber: 5 } },
    { groupLetter: 'M', sortOrder: 11, left: { rowCode: 'ML', side: 'L', startNumber: 1, endNumber: 3 } },
  ],
}

export function getLayoutForSection(sectionSlug: string): SectionLayoutDefinition {
  return sectionSlug === 'balcony' ? BALCONY_LAYOUT : GROUND_LAYOUT
}

/** Row groups sorted A → Z for seat map display (AL/AR, BL/BR, …) */
export function getAlphabeticalRowGroups(layout: SectionLayoutDefinition): RowGroupDefinition[] {
  return [...layout.rowGroups].sort((a, b) => a.groupLetter.localeCompare(b.groupLetter))
}

export function isRowBlockVisible(block: RowBlockDefinition | undefined, rowVisibility?: Record<string, boolean>): boolean {
  if (!block) return false
  if (block.visible === false) return false
  if (rowVisibility && rowVisibility[block.rowCode] === false) return false
  return true
}

export interface MapSeat {
  id: string
  rowCode: string
  letter: string
  side: 'L' | 'R'
  number: number
  status: 'available' | 'booked' | 'unavailable'
}

export function buildSeatMapFromApi(
  sectionSlug: string,
  rows: { rowCode: string; visible: boolean }[],
  apiSeats: { label: string; status: 'available' | 'booked' | 'hidden' }[],
): MapSeat[] {
  const rowVisibility = Object.fromEntries(rows.map((r) => [r.rowCode, r.visible]))
  const statusByLabel = new Map(apiSeats.map((s) => [s.label, s.status]))
  const layout = getLayoutForSection(sectionSlug)
  const seats: MapSeat[] = []

  for (const group of layout.rowGroups) {
    for (const block of [group.left, group.right].filter(Boolean) as RowBlockDefinition[]) {
      if (!isRowBlockVisible(block, rowVisibility)) continue

      for (let number = block.startNumber; number <= block.endNumber; number++) {
        const label = `${block.rowCode}${number}`
        const apiStatus = statusByLabel.get(label)
        if (apiStatus === 'hidden') continue

        seats.push({
          id: `${sectionSlug}-${label}`,
          rowCode: block.rowCode,
          letter: group.groupLetter,
          side: block.side,
          number,
          status: apiStatus === 'booked' ? 'booked' : 'available',
        })
      }
    }
  }

  return seats
}
