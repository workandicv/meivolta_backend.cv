import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@ApiTags('Rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a vehicle/e-bike rental' })
  create(@Req() req: any, @Body() dto: CreateRentalDto) {
    return this.rentalsService.create(req.user?.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my rentals' })
  findMy(@Req() req: any) {
    return this.rentalsService.findByUser(req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rentals (admin)' })
  findAll() {
    return this.rentalsService.findAll();
  }
}
