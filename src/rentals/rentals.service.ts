import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@Injectable()
export class RentalsService {
  private readonly logger = new Logger(RentalsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRentalDto) {
    this.logger.log(`Creating rental for user ${userId}`);
    const rental = await this.prisma.rental.create({
      data: { userId, ...dto },
    });
    // Award points
    await this.prisma.pointTransaction.create({
      data: { userId, points: 75, description: 'Vehicle rental' },
    }).catch(() => {});
    return rental;
  }

  async findByUser(userId: string) {
    return this.prisma.rental.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.rental.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
