import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/push-tokens')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register Expo push token for current user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token'],
      properties: { token: { type: 'string', example: 'ExponentPushToken[xxx]' } },
    },
  })
  register(@Request() req: any, @Body() body: { token: string }) {
    return this.notificationsService.registerPushToken(req.user.id, body.token);
  }
}
