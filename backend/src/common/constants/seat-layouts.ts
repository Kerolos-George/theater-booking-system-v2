export interface RowBlockDefinition {
  rowCode: string;
  side: 'L' | 'R';
  startNumber: number;
  endNumber: number;
}

export interface RowGroupDefinition {
  groupLetter: string;
  sortOrder: number;
  left?: RowBlockDefinition;
  right?: RowBlockDefinition;
}

export interface SectionLayoutDefinition {
  sectionType: 'GROUND' | 'BALCONY';
  rowGroups: RowGroupDefinition[];
}

/** Ground floor — A → P (alphabetical rows: AL/AR, BL/BR, …) */
export const GROUND_LAYOUT: SectionLayoutDefinition = {
  sectionType: 'GROUND',
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
};

/** Balcony — A (front) → M (back) */
export const BALCONY_LAYOUT: SectionLayoutDefinition = {
  sectionType: 'BALCONY',
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
    { groupLetter: 'M', sortOrder: 11, left: { rowCode: 'ML', side: 'L', startNumber: 1, endNumber: 3 }, right: undefined },
  ],
};

export const LAYOUT_BY_SECTION_TYPE: Record<'GROUND' | 'BALCONY', SectionLayoutDefinition> = {
  GROUND: GROUND_LAYOUT,
  BALCONY: BALCONY_LAYOUT,
};

export function flattenRowBlocks(layout: SectionLayoutDefinition): RowBlockDefinition[] {
  const blocks: RowBlockDefinition[] = [];
  for (const group of layout.rowGroups) {
    if (group.left) blocks.push(group.left);
    if (group.right) blocks.push(group.right);
  }
  return blocks;
}
