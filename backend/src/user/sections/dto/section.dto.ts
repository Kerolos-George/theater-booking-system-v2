import { ApiProperty } from '@nestjs/swagger';

export class SectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['GROUND', 'BALCONY'] })
  type: string;

  @ApiProperty({ example: 'ground' })
  slug: string;

  @ApiProperty({ example: 'الدور الأرضي' })
  labelAr: string;

  @ApiProperty()
  visible: boolean;

  @ApiProperty({ example: 60 })
  price: number;
}

export class RowResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'PL' })
  rowCode: string;

  @ApiProperty({ example: 'P' })
  groupLetter: string;

  @ApiProperty({ enum: ['L', 'R'] })
  side: string;

  @ApiProperty()
  startNumber: number;

  @ApiProperty()
  endNumber: number;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty({ description: 'When false, this row block is hidden and not bookable' })
  visible: boolean;
}

export class SeatResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'PL3' })
  label: string;

  @ApiProperty({ example: 'PL' })
  rowCode: string;

  @ApiProperty({ example: 3 })
  number: number;

  @ApiProperty({ enum: ['available', 'booked', 'hidden'] })
  status: 'available' | 'booked' | 'hidden';
}

export class SeatMapResponseDto {
  @ApiProperty({ type: [RowResponseDto] })
  rows: RowResponseDto[];

  @ApiProperty({ type: [SeatResponseDto] })
  seats: SeatResponseDto[];
}
