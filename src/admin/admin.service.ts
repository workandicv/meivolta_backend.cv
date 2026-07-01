import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserType, RideStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalTourists, totalDrivers, totalRides, pendingRides, totalBookings, pendingBookings, totalExcursions, totalPlaces] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { userType: UserType.TOURIST } }),
        this.prisma.user.count({ where: { userType: UserType.DRIVER } }),
        this.prisma.ride.count(),
        this.prisma.ride.count({ where: { status: RideStatus.PENDING } }),
        this.prisma.booking.count(),
        this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
        this.prisma.excursion.count({ where: { isActive: true } }),
        this.prisma.place.count({ where: { isActive: true } }),
      ]);

    return {
      totalUsers,
      totalTourists,
      totalDrivers,
      totalRides,
      pendingRides,
      totalBookings,
      pendingBookings,
      totalExcursions,
      totalPlaces,
      mockRevenue: 245000,
    };
  }

  async getUsers(query: { userType?: string; search?: string; page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.userType) where.userType = query.userType as UserType;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, userType: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    this.logger.log(`User ${id} toggled to isActive=${updated.isActive}`);
    return { id: updated.id, isActive: updated.isActive };
  }
}
