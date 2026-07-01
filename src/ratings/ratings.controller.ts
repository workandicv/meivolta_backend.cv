import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Ratings')
@Controller('api/ratings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get ratings for a target' })
  @ApiQuery({ name: 'targetType', required: true })
  @ApiQuery({ name: 'targetId', required: true })
  async getRatings(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.ratingsService.getRatings(targetType, targetId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a rating' })
  @ApiBody({ schema: { type: 'object', properties: { targetType: { type: 'string' }, targetId: { type: 'string' }, stars: { type: 'number' }, comment: { type: 'string' } } } })
  async createRating(
    @Request() req: any,
    @Body() body: { targetType: string; targetId: string; stars: number; comment?: string },
  ) {
    return this.ratingsService.createRating(
      req.user?.id ?? req.user?.sub,
      body.targetType,
      body.targetId,
      body.stars,
      body.comment,
    );
  }
}
