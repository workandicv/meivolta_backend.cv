import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RatingTargetType } from '@prisma/client';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(private prisma: PrismaService) {}

  async getRatings(targetType: string, targetId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { targetType: targetType as RatingTargetType, targetId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const count = ratings.length;
    const average = count > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / count : 0;
    return { ratings, count, average: Math.round(average * 10) / 10 };
  }

  async createRating(userId: string, targetType: string, targetId: string, stars: number, comment?: string) {
    this.logger.log(`Creating rating: user=${userId}, target=${targetType}/${targetId}, stars=${stars}`);
    return this.prisma.rating.create({
      data: { userId, targetType: targetType as RatingTargetType, targetId, stars, comment: comment ?? null },
    });
  }
}
