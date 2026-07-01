import { Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { RidesService } from './rides.service';

/**
 * Cron-callable endpoints (no JWT). Protected by a shared secret header so
 * only the scheduled task can trigger them. Used to repeatedly alert drivers
 * about pending rides even when their app is closed.
 */
@ApiTags('Rides Cron')
@Controller('api/rides-cron')
export class RidesCronController {
  constructor(
    private readonly ridesService: RidesService,
    private readonly config: ConfigService,
  ) {}

  @Post('notify-pending')
  @ApiOperation({ summary: 'Re-notify drivers of pending rides (cron only)' })
  @ApiHeader({ name: 'x-cron-secret', required: true })
  async notifyPending(@Headers('x-cron-secret') secret?: string) {
    const expected = this.config.get<string>('CRON_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    return this.ridesService.notifyPendingRides();
  }
}
