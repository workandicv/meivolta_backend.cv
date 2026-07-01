import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('TOURIST')
  @ApiOperation({ summary: 'Create a booking (tourist)' })
  create(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my bookings (tourist)' })
  @ApiQuery({ name: 'status', required: false })
  findMy(@Request() req: any, @Query('status') status?: string) {
    return this.bookingsService.findMy(req.user.id, status);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('GUIDE', 'DRIVER')
  @ApiOperation({ summary: 'Get pending bookings (guide/driver)' })
  findPending(@Request() req: any) {
    return this.bookingsService.findPending(req.user);
  }

  @Get('my-assignments')
  @UseGuards(RolesGuard)
  @Roles('GUIDE', 'DRIVER')
  @ApiOperation({ summary: 'Get bookings assigned to me (driver/guide)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'ACCEPTED', 'REJECTED'] })
  findMyAssignments(@Request() req: any, @Query('status') status?: string) {
    return this.bookingsService.findMyAssignments(req.user.id, status);
  }

  @Get('guide-history')
  @UseGuards(RolesGuard)
  @Roles('GUIDE', 'DRIVER')
  @ApiOperation({ summary: 'Get guide/driver booking history' })
  findGuideHistory(@Request() req: any) {
    return this.bookingsService.findGuideHistory(req.user);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all bookings (admin)' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.bookingsService.findAll(status);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign a booking to a driver/guide (admin)' })
  @ApiBody({ schema: { properties: { driverId: { type: 'string' } }, required: ['driverId'] } })
  assign(@Param('id') id: string, @Body() body: { driverId: string }) {
    return this.bookingsService.assignToDriver(id, body.driverId);
  }

  @Patch(':id/accept-assignment')
  @UseGuards(RolesGuard)
  @Roles('GUIDE', 'DRIVER')
  @ApiOperation({ summary: 'Accept an assignment (driver/guide)' })
  acceptAssignment(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.acceptAssignment(id, req.user.id);
  }

  @Patch(':id/reject-assignment')
  @UseGuards(RolesGuard)
  @Roles('GUIDE', 'DRIVER')
  @ApiOperation({ summary: 'Reject an assignment (driver/guide)' })
  rejectAssignment(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.rejectAssignment(id, req.user.id);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('GUIDE', 'DRIVER')
  @ApiOperation({ summary: 'Confirm a booking (guide/driver)' })
  confirm(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.confirm(id, req.user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (tourist)' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.cancel(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a booking (tourist - own bookings only)' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.remove(id, req.user.id);
  }
}
