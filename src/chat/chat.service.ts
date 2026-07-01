import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async getMessages(serviceType: string, serviceId: string) {
    return this.prisma.chatMessage.findMany({
      where: { serviceType, serviceId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  async createMessage(userId: string, serviceType: string, serviceId: string, message: string, messageType?: string, mediaUrl?: string) {
    this.logger.log(`Creating chat message: user=${userId}, type=${serviceType}, id=${serviceId}, msgType=${messageType ?? 'text'}`);
    return this.prisma.chatMessage.create({
      data: { userId, serviceType, serviceId, message, messageType: messageType ?? 'text', mediaUrl: mediaUrl ?? null },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
