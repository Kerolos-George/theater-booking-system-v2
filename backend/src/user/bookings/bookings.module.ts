import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PaymentUploadQueueService } from './payment-upload-queue.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [BookingsController],
  providers: [BookingsService, PaymentUploadQueueService],
})
export class BookingsModule {}
