import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeMobile } from '../../common/utils/mobile.util';
import { AuthResponseDto, LoginDto, SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('كلمتا المرور غير متطابقتين');
    }

    const mobile = normalizeMobile(dto.mobile);
    const name = dto.name.trim();

    const existing = await this.prisma.user.findUnique({ where: { mobile } });
    if (existing) {
      throw new ConflictException('رقم الموبايل مسجل بالفعل');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name, mobile, password: passwordHash },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const mobile = normalizeMobile(dto.mobile);
    const user = await this.prisma.user.findUnique({ where: { mobile } });

    if (!user) {
      throw new UnauthorizedException('رقم الموبايل أو كلمة المرور غير صحيحة');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('رقم الموبايل أو كلمة المرور غير صحيحة');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, mobile: true, createdAt: true },
    });

    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    return user;
  }

  private buildAuthResponse(user: { id: string; name: string; mobile: string }): AuthResponseDto {
    const payload = { sub: user.id, mobile: user.mobile, name: user.name };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, mobile: user.mobile },
    };
  }
}
