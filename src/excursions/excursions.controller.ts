import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ExcursionsService } from './excursions.service';
import { CreateExcursionDto, UpdateExcursionDto } from './dto/create-excursion.dto';

@ApiTags('Excursions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/excursions')
export class ExcursionsController {
  constructor(private readonly excursionsService: ExcursionsService) {}

  @Get()
  @ApiOperation({ summary: 'List excursions' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false })
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.excursionsService.findAll({ category, search, limit: limit ? parseInt(limit) : undefined, isActive });
  }

  // Driver endpoints - must be before :id routes
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('DRIVER', 'GUIDE')
  @ApiOperation({ summary: 'List my excursions (driver/guide)' })
  findMy(@Request() req: any) {
    return this.excursionsService.findByDriver(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get excursion details' })
  findOne(@Param('id') id: string) {
    return this.excursionsService.findOne(id);
  }

  @Get(':id/bookings')
  @UseGuards(RolesGuard)
  @Roles('DRIVER', 'GUIDE', 'ADMIN')
  @ApiOperation({ summary: 'Get bookings for an excursion (owner driver/guide or admin)' })
  findExcursionBookings(@Param('id') id: string, @Request() req: any) {
    return this.excursionsService.findExcursionBookings(id, req.user);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DRIVER', 'GUIDE')
  @ApiOperation({ summary: 'Create excursion' })
  create(@Request() req: any, @Body() dto: CreateExcursionDto) {
    const driverId = req.user.userType !== 'ADMIN' ? req.user.id : undefined;
    return this.excursionsService.create(dto, driverId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DRIVER', 'GUIDE')
  @ApiOperation({ summary: 'Update excursion' })
  update(@Param('id') id: string, @Body() dto: UpdateExcursionDto, @Request() req: any) {
    return this.excursionsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DRIVER', 'GUIDE')
  @ApiOperation({ summary: 'Soft-delete excursion' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.excursionsService.remove(id, req.user);
  }
}
