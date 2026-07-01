import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, AssignmentStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  private mapBooking(b: any) {
    return {
      id: b.id,
      userId: b.userId,
      userName: b.user?.name ?? null,
      excursionId: b.excursionId,
      excursionNameEn: b.excursion?.nameEn ?? null,
      excursionNamePt: b.excursion?.namePt ?? null,
      excursionImageUrl: b.excursion?.imageUrl ?? null,
      excursionPrice: b.excursion?.price ?? 0,
      excursionCategory: b.excursion?.category ?? null,
      date: b.date?.toISOString() ?? null,
      numberOfPeople: b.numberOfPeople,
      totalPrice: b.totalPrice,
      status: b.status,
      language: b.language ?? null,
      accommodation: b.accommodation ?? null,
      firstName: b.firstName ?? null,
      lastName: b.lastName ?? null,
      phoneCode: b.phoneCode ?? null,
      phone: b.phone ?? null,
      numAdults: b.numAdults ?? 0,
      numChildren: b.numChildren ?? 0,
      observations: b.observations ?? null,
      assignedDriverId: b.assignedDriverId ?? null,
      assignedDriverName: b.assignedDriver?.name ?? null,
      assignmentStatus: b.assignmentStatus ?? null,
      createdAt: b.createdAt.toISOString(),
    };
  }

  async create(userId: string, dto: CreateBookingDto) {
    const excursion = await this.prisma.excursion.findUnique({ where: { id: dto.excursionId } });
    if (!excursion) throw new NotFoundException('Excursion not found');
    if (!excursion.isActive) throw new BadRequestException('Excursion is not available');

    const numAdults = dto.numAdults ?? dto.numberOfPeople;
    const numChildren = dto.numChildren ?? 0;
    const totalPeople = numAdults + numChildren;
    const totalPrice = excursion.price * totalPeople;
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        excursionId: dto.excursionId,
        date: new Date(dto.date),
        numberOfPeople: totalPeople,
        totalPrice,
        language: dto.language ?? null,
        accommodation: dto.accommodation ?? null,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        phoneCode: dto.phoneCode ?? null,
        phone: dto.phone ?? null,
        numAdults,
        numChildren,
        observations: dto.observations ?? null,
      },
      include: { user: true, excursion: true, assignedDriver: true },
    });
    this.logger.log(`Booking created: ${booking.id}`);
    return this.mapBooking(booking);
  }

  private readonly bookingInclude = { user: true, excursion: true, assignedDriver: true };

  async findMy(userId: string, status?: string) {
    const where: any = { userId };
    if (status) where.status = status as BookingStatus;
    const bookings = await this.prisma.booking.findMany({
      where,
      include: this.bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return { items: bookings.map((b) => this.mapBooking(b)) };
  }

  async findPending(user?: any) {
    const where: any = { status: BookingStatus.PENDING };
    if (user?.userType === 'DRIVER') {
      where.excursion = { driverId: user.id };
    }
    const bookings = await this.prisma.booking.findMany({
      where,
      include: this.bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return { items: bookings.map((b) => this.mapBooking(b)) };
  }

  async findMyAssignments(driverId: string, status?: string) {
    const where: any = { assignedDriverId: driverId };
    if (status) where.assignmentStatus = status as AssignmentStatus;
    const bookings = await this.prisma.booking.findMany({
      where,
      include: this.bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return { items: bookings.map((b) => this.mapBooking(b)) };
  }

  async assignToDriver(bookingId: string, driverId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const driver = await this.prisma.user.findUnique({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.userType !== 'DRIVER' && driver.userType !== 'GUIDE') {
      throw new BadRequestException('User is not a driver or guide');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        assignedDriverId: driverId,
        assignmentStatus: AssignmentStatus.PENDING,
      },
      include: this.bookingInclude,
    });
    this.logger.log(`Booking ${bookingId} assigned to driver ${driverId}`);
    return this.mapBooking(updated);
  }

  async acceptAssignment(bookingId: string, driverId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.assignedDriverId !== driverId) throw new ForbiddenException('Not assigned to you');
    if (booking.assignmentStatus !== AssignmentStatus.PENDING) {
      throw new BadRequestException('Assignment is not pending');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { assignmentStatus: AssignmentStatus.ACCEPTED },
      include: this.bookingInclude,
    });
    this.logger.log(`Driver ${driverId} accepted assignment for booking ${bookingId}`);
    return this.mapBooking(updated);
  }

  async rejectAssignment(bookingId: string, driverId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.assignedDriverId !== driverId) throw new ForbiddenException('Not assigned to you');
    if (booking.assignmentStatus !== AssignmentStatus.PENDING) {
      throw new BadRequestException('Assignment is not pending');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { assignmentStatus: AssignmentStatus.REJECTED },
      include: this.bookingInclude,
    });
    this.logger.log(`Driver ${driverId} rejected assignment for booking ${bookingId}`);
    return this.mapBooking(updated);
  }

  async findGuideHistory(user?: any) {
    const where: any = { status: { in: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED] } };
    if (user?.userType === 'DRIVER') {
      where.excursion = { driverId: user.id };
    }
    const bookings = await this.prisma.booking.findMany({
      where,
      include: this.bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return { items: bookings.map((b) => this.mapBooking(b)) };
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status as BookingStatus;
    const bookings = await this.prisma.booking.findMany({
      where,
      include: this.bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return { items: bookings.map((b) => this.mapBooking(b)) };
  }

  async confirm(id: string, user?: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { excursion: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.PENDING) throw new BadRequestException('Booking is not pending');
    if (user?.userType === 'DRIVER' && booking.excursion?.driverId !== user.id) {
      throw new ForbiddenException('Not your excursion booking');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
      include: this.bookingInclude,
    });
    return this.mapBooking(updated);
  }

  async cancel(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
    if (booking.status !== BookingStatus.PENDING) throw new BadRequestException('Can only cancel pending bookings');

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: this.bookingInclude,
    });
    return this.mapBooking(updated);
  }

  async remove(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
    await this.prisma.booking.delete({ where: { id } });
    return { success: true };
  }
}
