import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveriesService {
  private readonly logger = new Logger(DeliveriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDeliveryDto) {
    this.logger.log(`Creating delivery for user ${userId}`);
    const delivery = await this.prisma.delivery.create({
      data: { userId, ...dto },
    });
    // Award points
    await this.prisma.pointTransaction.create({
      data: { userId, points: 30, description: 'Delivery request' },
    }).catch(() => {});
    return delivery;
  }

  async findByUser(userId: string) {
    return this.prisma.delivery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.delivery.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
