import { Module } from '@nestjs/common';
import { AdminAuthModule } from './auth/admin-auth.module';
import { AdminBookingsController } from './bookings/admin-bookings.controller';
import { AdminBookingsService } from './bookings/admin-bookings.service';
import { AdminEntryController } from './entry/admin-entry.controller';
import { AdminEntryService } from './entry/admin-entry.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminBookingsController, AdminEntryController],
  providers: [AdminBookingsService, AdminEntryService],
})
export class AdminModule {}
