import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { BookingsService } from './bookings.service';
import {
  BookedSeatsConflictDto,
  BookingResponseDto,
  CreateBookingDto,
} from './dto/booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('User Bookings')
@Controller('user/bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create booking with seat lock (max 5 seats, one active booking per user)',
    description:
      'Uses a database transaction with row locks to prevent double-booking when two users select the same seats simultaneously.',
  })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  @ApiResponse({ status: 409, type: BookedSeatsConflictDto })
  create(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user bookings' })
  findMine(@CurrentUser() user: AuthUserPayload) {
    return this.bookingsService.findMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single booking by id' })
  findOne(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.bookingsService.findOne(user.sub, id);
  }

  @Post(':id/payment')
  @ApiOperation({
    summary: 'Upload InstaPay payment proof',
    description: 'Uploads image to Supabase Storage and sets booking status to PENDING',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  submitPayment(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bookingsService.submitPayment(user.sub, id, file);
  }
}
