import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('api/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('messages')
  @ApiOperation({ summary: 'Get chat messages for a service' })
  @ApiQuery({ name: 'serviceType', required: true })
  @ApiQuery({ name: 'serviceId', required: true })
  async getMessages(
    @Query('serviceType') serviceType: string,
    @Query('serviceId') serviceId: string,
  ) {
    return this.chatService.getMessages(serviceType, serviceId);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a chat message' })
  @ApiBody({ schema: { type: 'object', properties: { serviceType: { type: 'string' }, serviceId: { type: 'string' }, message: { type: 'string' }, messageType: { type: 'string', enum: ['text', 'image', 'audio'] }, mediaUrl: { type: 'string' } } } })
  async createMessage(
    @Request() req: any,
    @Body() body: { serviceType: string; serviceId: string; message: string; messageType?: string; mediaUrl?: string },
  ) {
    return this.chatService.createMessage(
      req.user?.id ?? req.user?.sub,
      body.serviceType,
      body.serviceId,
      body.message,
      body.messageType,
      body.mediaUrl,
    );
  }
}
