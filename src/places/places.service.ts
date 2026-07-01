import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/create-place.dto';
import { PlaceType } from '@prisma/client';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: { type?: string; search?: string; limit?: number }) {
    const where: any = { isActive: true };
    if (query.type) where.type = query.type as PlaceType;
    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { namePt: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const places = await this.prisma.place.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
    });
    return { items: places };
  }

  async findOne(id: string) {
    const place = await this.prisma.place.findUnique({ where: { id } });
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  async create(dto: CreatePlaceDto) {
    const place = await this.prisma.place.create({
      data: { ...dto, type: dto.type as PlaceType },
    });
    this.logger.log(`Place created: ${place.id}`);
    return place;
  }

  async update(id: string, dto: UpdatePlaceDto) {
    await this.findOne(id);
    return this.prisma.place.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.place.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }
}
