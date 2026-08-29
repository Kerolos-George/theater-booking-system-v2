import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SeatMapResponseDto } from './dto/section.dto';

@ApiTags('User Sections')
@Controller('user/sections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List theater sections (ground / balcony) with visibility' })
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':sectionId/seats')
  @ApiOperation({ summary: 'Get seat map with row visibility and availability' })
  @ApiResponse({ status: 200, type: SeatMapResponseDto })
  getSeats(@Param('sectionId') sectionId: string): Promise<SeatMapResponseDto> {
    return this.sectionsService.getSeats(sectionId);
  }
}
