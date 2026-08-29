import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LookupEntryCodeDto {
  @ApiProperty({ example: '482913' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
