import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PointsService } from './points.service';

@ApiTags('Points')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get my MeiPoints balance and history' })
  getMyPoints(@Req() req: any) {
    return this.pointsService.getMyPoints(req.user?.id);
  }
}
