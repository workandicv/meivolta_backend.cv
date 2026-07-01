import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PlacesService } from './places.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/create-place.dto';

@ApiTags('Places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  @ApiOperation({ summary: 'List places (filterable by type)' })
  @ApiQuery({ name: 'type', required: false, enum: ['BEACH', 'RESTAURANT'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('type') type?: string, @Query('search') search?: string, @Query('limit') limit?: string) {
    return this.placesService.findAll({ type, search, limit: limit ? parseInt(limit) : undefined });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get place details' })
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create place (admin)' })
  create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update place (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Soft-delete place (admin)' })
  remove(@Param('id') id: string) {
    return this.placesService.remove(id);
  }
}
