import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { MAX_SEATS_PER_BOOKING } from '../../../common/constants/theater.constants';

export class BookingSeatInputDto {
  @ApiProperty({ example: 'AL3', description: 'Seat label e.g. AL3, BR5' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'محمد أحمد' })
  @IsString()
  @IsNotEmpty()
  attendeeName: string;
}

export class CreateBookingDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  sectionId: string;

  @ApiProperty({ example: 'أحمد محمد' })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({ example: '01012345678' })
  @IsString()
  @IsNotEmpty()
  whatsapp: string;

  @ApiProperty({ type: [BookingSeatInputDto], maxItems: MAX_SEATS_PER_BOOKING })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_SEATS_PER_BOOKING)
  @ValidateNested({ each: true })
  @Type(() => BookingSeatInputDto)
  seats: BookingSeatInputDto[];
}

export class BookedSeatsConflictDto {
  @ApiProperty({ example: 'بعض المقاعد محجوزة بالفعل' })
  message: string;

  @ApiProperty({ example: ['AL3', 'BR5'] })
  bookedSeats: string[];
}

export class BookingSeatResponseDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  attendeeName: string;
}

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'PRM-12345' })
  ref: string;

  @ApiProperty({ enum: ['UNPAID', 'PENDING', 'CONFIRMED', 'CANCELED'] })
  status: string;

  @ApiProperty()
  section: {
    id: string;
    type: string;
    slug: string;
    labelAr: string;
    price: number;
  };

  @ApiProperty()
  contactName: string;

  @ApiProperty()
  whatsapp: string;

  @ApiProperty({ nullable: true })
  paymentProofUrl: string | null;

  @ApiProperty({ nullable: true, description: 'WhatsApp entry code when confirmed' })
  entryCode: string | null;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ type: [BookingSeatResponseDto] })
  seats: BookingSeatResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    required: false,
    description: 'True when the image was saved but DB activation is still retrying under load',
  })
  paymentProcessing?: boolean;
}
