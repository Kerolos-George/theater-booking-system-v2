import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SECTION_TYPE_REVERSE } from '../../common/constants/theater.constants';
import { RowResponseDto, SeatMapResponseDto, SectionResponseDto } from './dto/section.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SectionResponseDto[]> {
    const sections = await this.prisma.section.findMany({
      orderBy: { type: 'asc' },
    });

    return sections.map((section) => ({
      id: section.id,
      type: section.type,
      slug: SECTION_TYPE_REVERSE[section.type] ?? section.type.toLowerCase(),
      labelAr: section.labelAr,
      visible: section.visible,
      price: section.price,
    }));
  }

  async getSeats(sectionId: string): Promise<SeatMapResponseDto> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException('القسم غير موجود');
    }

    if (!section.visible) {
      throw new BadRequestException('هذا القسم غير متاح للحجز حالياً');
    }

    const rows = await this.prisma.theaterRow.findMany({
      where: { sectionId },
      orderBy: [{ sortOrder: 'asc' }, { groupLetter: 'asc' }, { side: 'asc' }],
    });

    const seats = await this.prisma.seat.findMany({
      where: { sectionId },
      include: { theaterRow: true },
      orderBy: [{ rowCode: 'asc' }, { number: 'asc' }],
    });

    const rowDtos: RowResponseDto[] = rows.map((row) => ({
      id: row.id,
      rowCode: row.rowCode,
      groupLetter: row.groupLetter,
      side: row.side,
      startNumber: row.startNumber,
      endNumber: row.endNumber,
      sortOrder: row.sortOrder,
      visible: row.visible,
    }));

    const seatDtos = seats.map((seat) => ({
      id: seat.id,
      label: seat.label,
      rowCode: seat.rowCode,
      number: seat.number,
      status: !seat.theaterRow.visible
        ? ('hidden' as const)
        : seat.heldByBookingId
          ? ('booked' as const)
          : ('available' as const),
    }));

    return { rows: rowDtos, seats: seatDtos };
  }
}
