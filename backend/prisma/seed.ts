import { PrismaClient, SectionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  LAYOUT_BY_SECTION_TYPE,
  RowBlockDefinition,
  SectionLayoutDefinition,
} from '../src/common/constants/seat-layouts';

const prisma = new PrismaClient();

async function upsertTheaterRow(
  sectionId: string,
  groupLetter: string,
  sortOrder: number,
  block: RowBlockDefinition,
) {
  return prisma.theaterRow.upsert({
    where: {
      sectionId_rowCode: {
        sectionId,
        rowCode: block.rowCode,
      },
    },
    update: {
      groupLetter,
      side: block.side,
      startNumber: block.startNumber,
      endNumber: block.endNumber,
      sortOrder,
      visible: true,
    },
    create: {
      sectionId,
      rowCode: block.rowCode,
      groupLetter,
      side: block.side,
      startNumber: block.startNumber,
      endNumber: block.endNumber,
      sortOrder,
      visible: true,
    },
  });
}

async function seedSeatsForRow(
  sectionId: string,
  theaterRowId: string,
  rowCode: string,
  startNumber: number,
  endNumber: number,
) {
  for (let number = startNumber; number <= endNumber; number++) {
    const label = `${rowCode}${number}`;
    await prisma.seat.upsert({
      where: {
        sectionId_label: {
          sectionId,
          label,
        },
      },
      update: {
        theaterRowId,
        rowCode,
        number,
      },
      create: {
        sectionId,
        theaterRowId,
        rowCode,
        number,
        label,
      },
    });
  }
}

async function seedSection(type: SectionType, labelAr: string, visible: boolean, layout: SectionLayoutDefinition) {
  const section = await prisma.section.upsert({
    where: { type },
    update: { labelAr, visible, price: 75 },
    create: { type, labelAr, visible, price: 75 },
  });

  const validLabels = new Set<string>();

  for (const group of layout.rowGroups) {
    for (const block of [group.left, group.right].filter(Boolean) as RowBlockDefinition[]) {
      const row = await upsertTheaterRow(section.id, group.groupLetter, group.sortOrder, block);
      await seedSeatsForRow(section.id, row.id, block.rowCode, block.startNumber, block.endNumber);

      for (let n = block.startNumber; n <= block.endNumber; n++) {
        validLabels.add(`${block.rowCode}${n}`);
      }
    }
  }

  // Remove seats that no longer exist in this layout (e.g. after layout change)
  const existingSeats = await prisma.seat.findMany({
    where: { sectionId: section.id },
    select: { id: true, label: true, heldByBookingId: true },
  });

  const orphanIds = existingSeats.filter((s) => !validLabels.has(s.label) && !s.heldByBookingId).map((s) => s.id);
  if (orphanIds.length > 0) {
    await prisma.seat.deleteMany({ where: { id: { in: orphanIds } } });
  }

  return section;
}

async function seedAdmin() {
  const email = 'admin@gmail.com';
  const passwordHash = await bcrypt.hash('admin123456', 10);

  await prisma.admin.upsert({
    where: { email },
    update: { password: passwordHash, name: 'Admin' },
    create: { email, password: passwordHash, name: 'Admin' },
  });

  console.log('Seeded admin account:', email);
}

async function main() {
  await seedAdmin();
  await seedSection(SectionType.GROUND, 'الدور الأرضي', true, LAYOUT_BY_SECTION_TYPE.GROUND);
  await seedSection(SectionType.BALCONY, 'البالكون', true, LAYOUT_BY_SECTION_TYPE.BALCONY);
  console.log('Seeded ground + balcony layouts with per-row visibility support.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
