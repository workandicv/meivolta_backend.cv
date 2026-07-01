import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(private prisma: PrismaService) {}

  async getMyPoints(userId: string) {
    const transactions = await this.prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const totalPoints = transactions.reduce((sum, t) => sum + (t?.points ?? 0), 0);
    let level = 'Explorer';
    if (totalPoints >= 2000) level = 'VIP';
    else if (totalPoints >= 1000) level = 'Gold';
    else if (totalPoints >= 500) level = 'Silver';

    return {
      totalPoints,
      level,
      history: transactions.map((tx) => ({
        id: tx.id,
        description: tx.description,
        points: tx.points,
        date: tx.createdAt,
      })),
    };
  }
}
