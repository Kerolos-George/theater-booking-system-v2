import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminBookingDto } from '../bookings/dto/admin-booking.dto';
import { AdminBookingsService } from '../bookings/admin-bookings.service';

@Injectable()
export class AdminEntryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminBookingsService: AdminBookingsService,
  ) {}

  async lookup(code: string): Promise<AdminBookingDto> {
    const booking = await this.findConfirmedByCode(code);
    if (!booking) {
      throw new NotFoundException('كود الدخول غير صحيح');
    }

    return this.adminBookingsService.findOne(booking.id);
  }

  async redeem(code: string): Promise<AdminBookingDto> {
    const normalized = code.trim();
    const existing = await this.findConfirmedByCode(normalized);

    if (!existing) {
      throw new NotFoundException('كود الدخول غير صحيح');
    }

    if (existing.entryCodeUsedAt) {
      throw new BadRequestException('تم استخدام هذا الكود مسبقاً');
    }

    const updated = await this.prisma.booking.updateMany({
      where: {
        id: existing.id,
        status: BookingStatus.CONFIRMED,
        entryCodeUsedAt: null,
      },
      data: {
        entryCodeUsedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      throw new BadRequestException('تم استخدام هذا الكود مسبقاً');
    }

    return this.adminBookingsService.findOne(existing.id);
  }

  private findConfirmedByCode(code: string) {
    const normalized = code.trim();
    return this.prisma.booking.findFirst({
      where: {
        entryCode: normalized,
        status: BookingStatus.CONFIRMED,
      },
      select: { id: true, entryCodeUsedAt: true },
    });
  }
}
