import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { AdminBookingDto } from '../bookings/dto/admin-booking.dto';
import { AdminEntryService } from './admin-entry.service';
import { LookupEntryCodeDto } from './dto/entry-code.dto';

@ApiTags('Admin Entry')
@Controller('admin/entry')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth()
export class AdminEntryController {
  constructor(private readonly adminEntryService: AdminEntryService) {}

  @Post('lookup')
  @ApiOperation({ summary: 'Look up a confirmed booking by entry code' })
  lookup(@Body() dto: LookupEntryCodeDto): Promise<AdminBookingDto> {
    return this.adminEntryService.lookup(dto.code);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Mark entry code as used (one-time)' })
  redeem(@Body() dto: LookupEntryCodeDto): Promise<AdminBookingDto> {
    return this.adminEntryService.redeem(dto.code);
  }
}
