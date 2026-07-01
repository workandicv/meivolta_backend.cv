import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { placeId: string; date: string; time: string; guests: number; notes?: string }) {
    this.logger.log(`Creating reservation: user=${userId}, place=${data.placeId}`);
    return this.prisma.tableReservation.create({
      data: {
        userId,
        placeId: data.placeId,
        date: data.date,
        time: data.time,
        guests: data.guests,
        notes: data.notes ?? null,
        status: 'PENDING',
      },
    });
  }

  async getByUser(userId: string) {
    return this.prisma.tableReservation.findMany({
      where: { userId },
      include: { place: { select: { id: true, namePt: true, nameEn: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
