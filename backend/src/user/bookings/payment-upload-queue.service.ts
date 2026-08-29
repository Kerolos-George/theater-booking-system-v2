import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { BookingStatus, PaymentUploadJobStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PaymentUploadQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentUploadQueueService.name)
  private readonly maxAttempts = 12
  private readonly pollIntervalMs = 15_000
  private timer?: NodeJS.Timeout
  private processing = false

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.processPending()
    }, this.pollIntervalMs)
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer)
  }

  async hasPendingJob(bookingId: string): Promise<boolean> {
    const job = await this.prisma.paymentUploadJob.findUnique({
      where: { bookingId },
      select: { status: true },
    })

    return job?.status === PaymentUploadJobStatus.PENDING
  }

  async enqueue(bookingId: string, userId: string, publicUrl: string): Promise<void> {
    await this.prisma.paymentUploadJob.upsert({
      where: { bookingId },
      create: {
        bookingId,
        userId,
        publicUrl,
        status: PaymentUploadJobStatus.PENDING,
      },
      update: {
        publicUrl,
        status: PaymentUploadJobStatus.PENDING,
        attempts: 0,
        lastError: null,
      },
    })
  }

  async processPending(): Promise<void> {
    if (this.processing) return

    this.processing = true

    try {
      const jobs = await this.prisma.paymentUploadJob.findMany({
        where: {
          status: PaymentUploadJobStatus.PENDING,
          attempts: { lt: this.maxAttempts },
        },
        orderBy: { createdAt: 'asc' },
        take: 25,
      })

      for (const job of jobs) {
        await this.processJob(job.id, job.bookingId, job.userId, job.publicUrl)
      }
    } catch (error) {
      this.logger.error('Payment upload queue sweep failed', error)
    } finally {
      this.processing = false
    }
  }

  private async processJob(
    jobId: string,
    bookingId: string,
    userId: string,
    publicUrl: string,
  ): Promise<void> {
    try {
      const updated = await this.prisma.booking.updateMany({
        where: {
          id: bookingId,
          userId,
          status: BookingStatus.UNPAID,
        },
        data: {
          paymentProofUrl: publicUrl,
          status: BookingStatus.PENDING,
        },
      })

      if (updated.count === 0) {
        const booking = await this.prisma.booking.findUnique({
          where: { id: bookingId },
          select: { status: true },
        })

        if (
          booking?.status === BookingStatus.PENDING ||
          booking?.status === BookingStatus.CONFIRMED
        ) {
          await this.markCompleted(jobId)
          return
        }

        throw new Error('Booking is not eligible for payment activation')
      }

      await this.markCompleted(jobId)
      this.logger.log(`Payment upload job completed for booking ${bookingId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      await this.prisma.paymentUploadJob.update({
        where: { id: jobId },
        data: {
          attempts: { increment: 1 },
          lastError: message,
        },
      })

      this.logger.warn(`Payment upload job retry scheduled for booking ${bookingId}: ${message}`)
    }
  }

  private async markCompleted(jobId: string): Promise<void> {
    await this.prisma.paymentUploadJob.update({
      where: { id: jobId },
      data: { status: PaymentUploadJobStatus.COMPLETED },
    })
  }
}
