import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Reservations')
@Controller('api/reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a table reservation' })
  @ApiBody({ schema: { type: 'object', properties: { placeId: { type: 'string' }, date: { type: 'string' }, time: { type: 'string' }, guests: { type: 'number' }, notes: { type: 'string' } } } })
  async create(
    @Request() req: any,
    @Body() body: { placeId: string; date: string; time: string; guests: number; notes?: string },
  ) {
    return this.reservationsService.create(req.user?.id ?? req.user?.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get user reservations' })
  async getByUser(@Request() req: any) {
    return this.reservationsService.getByUser(req.user?.id ?? req.user?.sub);
  }
}
