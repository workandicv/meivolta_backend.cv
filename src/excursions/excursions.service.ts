import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExcursionDto, UpdateExcursionDto } from './dto/create-excursion.dto';
import { ExcursionCategory, BookingStatus } from '@prisma/client';

@Injectable()
export class ExcursionsService {
  private readonly logger = new Logger(ExcursionsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: { category?: string; search?: string; limit?: number; isActive?: string }) {
    const where: any = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    } else {
      where.isActive = true;
    }
    if (query.category) where.category = query.category as ExcursionCategory;
    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { namePt: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const excursions = await this.prisma.excursion.findMany({
      where,
      include: { driver: { select: { id: true, name: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
    });
    return { items: excursions };
  }

  async findOne(id: string) {
    const exc = await this.prisma.excursion.findUnique({
      where: { id },
      include: { driver: { select: { id: true, name: true, phone: true } } },
    });
    if (!exc) throw new NotFoundException('Excursion not found');
    return exc;
  }

  async findByDriver(driverId: string) {
    const excursions = await this.prisma.excursion.findMany({
      where: { driverId },
      include: {
        _count: { select: { bookings: true } },
        driver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { items: excursions };
  }

  async findExcursionBookings(excursionId: string, user: any) {
    const exc = await this.prisma.excursion.findUnique({ where: { id: excursionId } });
    if (!exc) throw new NotFoundException('Excursion not found');
    // Only the owner driver/guide or admin can see bookings
    if (user.userType !== 'ADMIN' && exc.driverId !== user.id) {
      throw new ForbiddenException('Not your excursion');
    }
    const bookings = await this.prisma.booking.findMany({
      where: { excursionId },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { items: bookings };
  }

  async create(dto: CreateExcursionDto, driverId?: string) {
    const exc = await this.prisma.excursion.create({
      data: {
        ...dto,
        category: dto.category as ExcursionCategory,
        driverId: driverId ?? null,
      },
    });
    this.logger.log(`Excursion created: ${exc.id} by driver: ${driverId ?? 'admin'}`);
    return exc;
  }

  async update(id: string, dto: UpdateExcursionDto, user: any) {
    const exc = await this.findOne(id);
    if (user.userType !== 'ADMIN' && exc.driverId !== user.id) {
      throw new ForbiddenException('Not your excursion');
    }
    const data: any = { ...dto };
    if (dto.category) data.category = dto.category as ExcursionCategory;
    const updated = await this.prisma.excursion.update({ where: { id }, data });
    return updated;
  }

  async remove(id: string, user: any) {
    const exc = await this.findOne(id);
    if (user.userType !== 'ADMIN' && exc.driverId !== user.id) {
      throw new ForbiddenException('Not your excursion');
    }
    await this.prisma.excursion.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}
