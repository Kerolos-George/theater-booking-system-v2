import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminListBookingsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ description: 'Filter by user mobile — searches all bookings, then paginates' })
  @IsOptional()
  @IsString()
  mobile?: string;
}

export class AdminBookingSeatDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  attendeeName: string;
}

export class AdminBookingUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  mobile: string;
}

export class AdminBookingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ref: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  contactName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  whatsapp: string;

  @ApiProperty({ nullable: true })
  paymentProofUrl: string | null;

  @ApiProperty({ nullable: true })
  entryCode: string | null;

  @ApiProperty()
  entryCodeUsed: boolean;

  @ApiProperty({ nullable: true })
  entryCodeUsedAt: Date | null;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  section: {
    id: string;
    type: string;
    slug: string;
    labelAr: string;
    price: number;
  };

  @ApiProperty()
  user: AdminBookingUserDto;

  @ApiProperty({ type: [AdminBookingSeatDto] })
  seats: AdminBookingSeatDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminPaginatedBookingsDto {
  @ApiProperty({ type: [AdminBookingDto] })
  items: AdminBookingDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
