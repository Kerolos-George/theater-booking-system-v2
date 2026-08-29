import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../../common/guards/admin-jwt-auth.guard';
import { CurrentAdmin, AuthAdminPayload } from '../../common/decorators/current-admin.decorator';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthResponseDto, AdminLoginDto } from './dto/admin-auth.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login with email and password' })
  login(@Body() dto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    return this.adminAuthService.login(dto);
  }

  @Get('me')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  me(@CurrentAdmin() admin: AuthAdminPayload) {
    return this.adminAuthService.getProfile(admin.sub);
  }
}
