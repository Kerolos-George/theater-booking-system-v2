import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentUploadJobStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MAX_SEATS_PER_BOOKING, SECTION_TYPE_REVERSE, calculateBookingTotal } from '../../common/constants/theater.constants';
import { normalizeEmail } from '../../common/utils/email.util';
import { normalizeMobile } from '../../common/utils/mobile.util';
import { BookingFlowError } from '../../common/errors/booking-flow.error';
import { rethrowBookingFlowError } from '../../common/errors/rethrow-booking-flow.error';
import { withRetry } from '../../common/utils/retry.util';
import { StorageService } from '../storage/storage.service';
import { BookingResponseDto, CreateBookingDto } from './dto/booking.dto';
import { PaymentUploadQueueService } from './payment-upload-queue.service';

type SeatRow = {
  id: string;
  label: string;
  held_by_booking_id: string | null;
  row_visible: boolean;
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly paymentUploadQueue: PaymentUploadQueueService,
  ) {}

  async create(userId: string, dto: CreateBookingDto): Promise<BookingResponseDto> {
    const uniqueLabels = new Set(dto.seats.map((s) => s.label.trim().toUpperCase()));
    if (uniqueLabels.size !== dto.seats.length) {
      throw new BadRequestException('لا يمكن اختيار نفس المقعد أكثر من مرة');
    }

    if (dto.seats.length > MAX_SEATS_PER_BOOKING) {
      throw new BadRequestException(`الحد الأقصى ${MAX_SEATS_PER_BOOKING} مقاعد لكل حجز`);
    }

    const activeBooking = await this.prisma.booking.findFirst({
      where: {
        userId,
        status: { not: BookingStatus.CANCELED },
      },
      select: { id: true },
    });

    if (activeBooking) {
      throw new ConflictException(
        'لديك حجز نشط بالفعل. لا يمكن إنشاء حجز جديد إلا إذا كان الحجز السابق ملغياً',
      );
    }

    const email = normalizeEmail(dto.email);
    const emailBooking = await this.prisma.booking.findFirst({
      where: {
        email,
        status: { not: BookingStatus.CANCELED },
      },
      select: { id: true, userId: true },
    });

    if (emailBooking) {
      throw new ConflictException(
        emailBooking.userId === userId
          ? 'البريد الإلكتروني مستخدم بالفعل في أحد حجوزاتك النشطة'
          : 'البريد الإلكتروني مستخدم بالفعل في حجز نشط آخر',
      );
    }

    const section = await this.prisma.section.findUnique({ where: { id: dto.sectionId } });
    if (!section) {
      throw new NotFoundException('القسم غير موجود');
    }
    if (!section.visible) {
      throw new BadRequestException('هذا القسم غير متاح للحجز حالياً');
    }

    let booking;

    try {
      booking = await this.prisma.$transaction(
        async (tx) => {
          const labels = [...uniqueLabels];
          const lockedSeats = await tx.$queryRaw<SeatRow[]>`
            SELECT s.id, s.label, s.held_by_booking_id, tr.visible AS row_visible
            FROM seats s
            INNER JOIN theater_rows tr ON tr.id = s.theater_row_id
            WHERE s.section_id = ${dto.sectionId}
              AND s.label IN (${Prisma.join(labels)})
            FOR UPDATE OF s
          `;

          if (lockedSeats.length !== labels.length) {
            const found = new Set(lockedSeats.map((s) => s.label));
            const missing = labels.filter((label) => !found.has(label));
            throw new BookingFlowError(`مقاعد غير موجودة: ${missing.join(', ')}`, 400);
          }

          const hiddenSeats = lockedSeats.filter((seat) => !seat.row_visible);
          if (hiddenSeats.length > 0) {
            throw new BookingFlowError(
              `صفوف غير متاحة للحجز: ${hiddenSeats.map((s) => s.label).join(', ')}`,
              400,
            );
          }

          const alreadyBooked = lockedSeats.filter((seat) => seat.held_by_booking_id !== null);
          if (alreadyBooked.length > 0) {
            throw new BookingFlowError('بعض المقاعد محجوزة بالفعل', 409, {
              message: 'بعض المقاعد محجوزة بالفعل',
              bookedSeats: alreadyBooked.map((seat) => seat.label),
            });
          }

          const ref = this.generateRef();
          const totalAmount = calculateBookingTotal(lockedSeats.length, section.price);

          const created = await tx.booking.create({
            data: {
              ref,
              userId,
              sectionId: section.id,
              status: BookingStatus.UNPAID,
              contactName: dto.contactName.trim(),
              email,
              whatsapp: normalizeMobile(dto.whatsapp),
              totalAmount,
              seats: {
                create: dto.seats.map((seatInput) => {
                  const label = seatInput.label.trim().toUpperCase();
                  const seat = lockedSeats.find((s) => s.label === label);
                  if (!seat) {
                    throw new BookingFlowError(`المقعد ${label} غير موجود`, 400);
                  }
                  return {
                    seatId: seat.id,
                    attendeeName: seatInput.attendeeName.trim(),
                  };
                }),
              },
            },
          });

          for (const seat of lockedSeats) {
            const updated = await tx.seat.updateMany({
              where: { id: seat.id, heldByBookingId: null },
              data: { heldByBookingId: created.id },
            });

            if (updated.count !== 1) {
              throw new BookingFlowError('بعض المقاعد محجوزة بالفعل', 409, {
                message: 'بعض المقاعد محجوزة بالفعل',
                bookedSeats: [seat.label],
              });
            }
          }

          return tx.booking.findUniqueOrThrow({
            where: { id: created.id },
            include: {
              section: true,
              seats: { include: { seat: true } },
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
          maxWait: 5000,
          timeout: 15000,
        },
      );
    } catch (error) {
      rethrowBookingFlowError(error);
    }

    return this.mapBooking(booking);
  }

  async findMine(userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        section: true,
        seats: { include: { seat: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingJobIds = await this.getPendingUploadBookingIds(bookings.map((booking) => booking.id));

    return bookings.map((booking) =>
      this.mapBooking(
        booking,
        pendingJobIds.has(booking.id) && booking.status === BookingStatus.UNPAID,
      ),
    );
  }

  async findOne(userId: string, bookingId: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        section: true,
        seats: { include: { seat: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('لا يمكنك عرض هذا الحجز');
    }

    const paymentProcessing =
      booking.status === BookingStatus.UNPAID && (await this.paymentUploadQueue.hasPendingJob(bookingId));

    return this.mapBooking(booking, paymentProcessing);
  }

  async submitPayment(userId: string, bookingId: string, file: Express.Multer.File): Promise<BookingResponseDto> {
    if (!file) {
      throw new BadRequestException('يرجى رفع صورة إثبات الدفع');
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMime.includes(file.mimetype)) {
      throw new BadRequestException('صيغ الملف المدعومة: JPG, PNG');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, userId: true, status: true },
    });

    if (!booking) {
      throw new NotFoundException('الحجز غير موجود');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('لا يمكنك تعديل هذا الحجز');
    }

    if (booking.status === BookingStatus.CANCELED) {
      throw new BadRequestException('الحجز ملغي');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('الحجز مؤكد بالفعل');
    }

    if (booking.status === BookingStatus.PENDING) {
      throw new BadRequestException('تم رفع إثبات الدفع مسبقاً وهو قيد المراجعة');
    }

    if (booking.status !== BookingStatus.UNPAID) {
      throw new BadRequestException('لا يمكن رفع الدفع لهذا الحجز');
    }

    if (await this.paymentUploadQueue.hasPendingJob(bookingId)) {
      throw new BadRequestException('إثبات الدفع قيد المعالجة. يرجى الانتظار قليلاً');
    }

    let paymentProofUrl: string;
    try {
      paymentProofUrl = await this.storageService.uploadPaymentProof(userId, bookingId, file);
    } catch {
      throw new InternalServerErrorException('فشل رفع الصورة. حاول مرة أخرى');
    }

    let paymentProcessing = false;

    try {
      await withRetry(() => this.applyPayment(bookingId, userId, paymentProofUrl), {
        attempts: 3,
        delayMs: 500,
        backoff: 2,
      });
    } catch {
      await this.paymentUploadQueue.enqueue(bookingId, userId, paymentProofUrl);
      void this.paymentUploadQueue.processPending();
      paymentProcessing = true;
    }

    const updated = await this.loadBookingOrThrow(bookingId);
    return this.mapBooking(updated, paymentProcessing);
  }

  private async applyPayment(bookingId: string, userId: string, paymentProofUrl: string): Promise<void> {
    const updated = await this.prisma.booking.updateMany({
      where: {
        id: bookingId,
        userId,
        status: BookingStatus.UNPAID,
      },
      data: {
        paymentProofUrl,
        status: BookingStatus.PENDING,
      },
    });

    if (updated.count === 0) {
      throw new Error('Could not activate payment on booking');
    }
  }

  private async loadBookingOrThrow(bookingId: string) {
    return this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        section: true,
        seats: { include: { seat: true } },
      },
    });
  }

  private async getPendingUploadBookingIds(bookingIds: string[]): Promise<Set<string>> {
    if (bookingIds.length === 0) return new Set();

    try {
      const jobs = await this.prisma.paymentUploadJob.findMany({
        where: {
          bookingId: { in: bookingIds },
          status: PaymentUploadJobStatus.PENDING,
        },
        select: { bookingId: true },
      });

      return new Set(jobs.map((job) => job.bookingId));
    } catch {
      return new Set();
    }
  }

  private generateRef(): string {
    return `PRM-${Math.floor(10000 + Math.random() * 89999)}`;
  }

  private mapBooking(
    booking: Prisma.BookingGetPayload<{
      include: { section: true; seats: { include: { seat: true } } };
    }>,
    paymentProcessing = false,
  ): BookingResponseDto {
    return {
      id: booking.id,
      ref: booking.ref,
      status: booking.status,
      section: {
        id: booking.section.id,
        type: booking.section.type,
        slug: SECTION_TYPE_REVERSE[booking.section.type] ?? booking.section.type.toLowerCase(),
        labelAr: booking.section.labelAr,
        price: booking.section.price,
      },
      contactName: booking.contactName,
      email: booking.email,
      whatsapp: booking.whatsapp,
      paymentProofUrl: booking.paymentProofUrl,
      entryCode: booking.entryCode,
      totalAmount: booking.totalAmount,
      seats: booking.seats.map((bookingSeat) => ({
        label: bookingSeat.seat.label,
        attendeeName: bookingSeat.attendeeName,
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      ...(paymentProcessing ? { paymentProcessing: true } : {}),
    };
  }
}
