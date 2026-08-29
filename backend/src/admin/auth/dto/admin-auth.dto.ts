import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class AdminAuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  admin: {
    id: string;
    email: string;
    name: string;
  };
}
