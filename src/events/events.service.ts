import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { EventCategory } from '@prisma/client';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: { category?: string; limit?: number }) {
    const where: any = { isActive: true };
    if (query.category) where.category = query.category;
    const events = await this.prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      take: query.limit ?? 50,
    });
    return { items: events };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({ data: { ...dto, category: dto.category as EventCategory, date: new Date(dto.date), endDate: dto.endDate ? new Date(dto.endDate) : null } });
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.event.update({ where: { id }, data: { isActive: false } });
  }
}
