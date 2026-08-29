import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { AdminBookingsService } from './admin-bookings.service';
import {
  AdminBookingDto,
  AdminListBookingsQueryDto,
  AdminPaginatedBookingsDto,
} from './dto/admin-booking.dto';

@ApiTags('Admin Bookings')
@Controller('admin/bookings')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth()
export class AdminBookingsController {
  constructor(private readonly adminBookingsService: AdminBookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all bookings (paginated, optional mobile filter across all data)' })
  list(@Query() query: AdminListBookingsQueryDto): Promise<AdminPaginatedBookingsDto> {
    return this.adminBookingsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  findOne(@Param('id') id: string): Promise<AdminBookingDto> {
    return this.adminBookingsService.findOne(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking and generate 6-digit entry code' })
  confirm(@Param('id') id: string): Promise<AdminBookingDto> {
    return this.adminBookingsService.confirm(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking and release seats' })
  cancel(@Param('id') id: string): Promise<AdminBookingDto> {
    return this.adminBookingsService.cancel(id);
  }
}
