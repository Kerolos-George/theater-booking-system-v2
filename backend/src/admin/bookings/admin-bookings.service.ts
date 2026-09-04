import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { SECTION_TYPE_REVERSE } from '../../common/constants/theater.constants';
import { normalizeMobile } from '../../common/utils/mobile.util';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { generateUniqueEntryCode } from '../utils/entry-code.util';
import {
  AdminBookingDto,
  AdminListBookingsQueryDto,
  AdminPaginatedBookingsDto,
} from './dto/admin-booking.dto';

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    user: { select: { id: true; name: true; mobile: true } };
    section: true;
    seats: { include: { seat: true } };
  };
}>;

@Injectable()
export class AdminBookingsService {
  private readonly logger = new Logger(AdminBookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async list(query: AdminListBookingsQueryDto): Promise<AdminPaginatedBookingsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (query.mobile?.trim()) {
      const mobile = normalizeMobile(query.mobile);
      where.user = {
        mobile: {
          contains: mobile,
        },
      };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, mobile: true } },
          section: true,
          seats: { include: { seat: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      items: bookings.map((booking) => this.mapBooking(booking)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(bookingId: string): Promise<AdminBookingDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, mobile: true } },
        section: true,
        seats: { include: { seat: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    return this.mapBooking(booking);
  }

  async confirm(bookingId: string): Promise<AdminBookingDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    if (booking.status === BookingStatus.CANCELED) {
      throw new BadRequestException('لا يمكن تأكيد حجز ملغي');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('الحجز مؤكد بالفعل');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('يمكن تأكيد الحجوزات قيد المراجعة فقط (بعد رفع إثبات الدفع)');
    }

    const entryCode = await generateUniqueEntryCode(this.prisma);

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        entryCode,
      },
      include: {
        user: { select: { id: true, name: true, mobile: true } },
        section: true,
        seats: { include: { seat: true } },
      },
    });

    const mapped = this.mapBooking(updated);

    try {
      await this.mailService.sendBookingConfirmation({
        to: updated.email,
        contactName: updated.contactName,
        userMobile: updated.user.mobile,
        whatsapp: updated.whatsapp,
        ref: updated.ref,
        sectionLabel: updated.section.labelAr,
        seatCount: updated.seats.length,
        seats: updated.seats.map((s) => ({
          label: s.seat.label,
          attendeeName: s.attendeeName,
        })),
        entryCode,
      });
    } catch (error) {
      this.logger.error('Failed to send confirmation email', error);
    }

    return mapped;
  }

  async cancel(bookingId: string): Promise<AdminBookingDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    if (booking.status === BookingStatus.CANCELED) {
      throw new BadRequestException('الحجز ملغي بالفعل');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.seat.updateMany({
        where: { heldByBookingId: bookingId },
        data: { heldByBookingId: null },
      });

      return tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELED,
          entryCode: null,
          entryCodeUsedAt: null,
        },
        include: {
          user: { select: { id: true, name: true, mobile: true } },
          section: true,
          seats: { include: { seat: true } },
        },
      });
    });

    return this.mapBooking(updated);
  }

  private mapBooking(booking: BookingWithRelations): AdminBookingDto {
    return {
      id: booking.id,
      ref: booking.ref,
      status: booking.status,
      contactName: booking.contactName,
      email: booking.email,
      whatsapp: booking.whatsapp,
      paymentProofUrl: booking.paymentProofUrl,
      entryCode: booking.entryCode,
      entryCodeUsed: booking.entryCodeUsedAt !== null,
      entryCodeUsedAt: booking.entryCodeUsedAt,
      totalAmount: booking.totalAmount,
      section: {
        id: booking.section.id,
        type: booking.section.type,
        slug: SECTION_TYPE_REVERSE[booking.section.type] ?? booking.section.type.toLowerCase(),
        labelAr: booking.section.labelAr,
        price: booking.section.price,
      },
      user: booking.user,
      seats: booking.seats.map((bookingSeat) => ({
        label: bookingSeat.seat.label,
        attendeeName: bookingSeat.attendeeName,
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
