import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SectionsModule } from './sections/sections.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [AuthModule, SectionsModule, BookingsModule],
})
export class UserModule {}
