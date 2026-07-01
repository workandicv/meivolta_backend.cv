import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@ApiTags('Deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @ApiOperation({ summary: 'Request a delivery' })
  create(@Req() req: any, @Body() dto: CreateDeliveryDto) {
    return this.deliveriesService.create(req.user?.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my deliveries' })
  findMy(@Req() req: any) {
    return this.deliveriesService.findByUser(req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all deliveries (admin)' })
  findAll() {
    return this.deliveriesService.findAll();
  }
}
