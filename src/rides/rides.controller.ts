import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Rides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/rides')
export class RidesController {
  constructor(
    private readonly ridesService: RidesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles('TOURIST')
  @ApiOperation({ summary: 'Create a ride request' })
  create(@Request() req: any, @Body() dto: CreateRideDto) {
    return this.ridesService.create(req.user.id, dto);
  }

  @Patch('location/update')
  @ApiOperation({ summary: 'Update user GPS location' })
  async updateLocation(@Request() req: any, @Body() body: UpdateLocationDto) {
    await this.prisma.user.update({
      where: { id: req.user.id },
      data: { latitude: body?.latitude, longitude: body?.longitude, locationUpdatedAt: new Date() },
    });
    return { success: true };
  }

  @Get('online-drivers/count')
  @ApiOperation({ summary: 'Get count of currently online drivers' })
  async getOnlineDriversCount() {
    const count = await this.prisma.user.count({
      where: { userType: { in: ['DRIVER', 'GUIDE'] }, isOnline: true },
    });
    return { count };
  }

  @Get('driver-stats')
  @Roles('DRIVER', 'GUIDE')
  @ApiOperation({ summary: 'Get driver activity stats (completed rides, online time, hours worked)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  getDriverStats(@Request() req: any, @Query('period') period?: string) {
    return this.ridesService.getDriverStats(req.user.id, period ?? 'today');
  }

  @Get('active')
  @ApiOperation({ summary: 'Get current active ride for user (ACCEPTED or IN_PROGRESS)' })
  getActiveRide(@Request() req: any) {
    return this.ridesService.getActiveRide(req.user.id, req.user.userType);
  }

  @Get()
  @ApiOperation({ summary: 'List rides (role-based)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Request() req: any, @Query('status') status?: string, @Query('driverId') driverId?: string, @Query('limit') limit?: string) {
    return this.ridesService.findAll(req.user, { status, driverId, limit: limit ? parseInt(limit) : undefined });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ride details with driver/user location' })
  findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get real-time tracking data for a ride (lightweight)' })
  getTracking(@Param('id') id: string, @Request() req: any) {
    return this.ridesService.getTracking(id, req.user.id);
  }

  @Patch(':id/location')
  @ApiOperation({ summary: 'Update location for an active ride' })
  async updateRideLocation(@Param('id') id: string, @Request() req: any, @Body() body: UpdateLocationDto) {
    return this.ridesService.updateRideLocation(id, req.user.id, body);
  }

  @Patch(':id/accept')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Driver accepts a ride' })
  accept(@Param('id') id: string, @Request() req: any) {
    return this.ridesService.accept(id, req.user.id);
  }

  @Patch(':id/start')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Driver starts the ride (pickup confirmed)' })
  start(@Param('id') id: string, @Request() req: any) {
    return this.ridesService.start(id, req.user.id);
  }

  @Patch(':id/complete')
  @Roles('DRIVER')
  @ApiOperation({ summary: 'Driver completes a ride' })
  complete(@Param('id') id: string, @Request() req: any) {
    return this.ridesService.complete(id, req.user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a ride (tourist for PENDING, driver/tourist for ACCEPTED)' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.ridesService.cancel(id, req.user.id, req.user.userType);
  }
}
