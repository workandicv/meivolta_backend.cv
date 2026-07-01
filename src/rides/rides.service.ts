import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { RideStatus, ServiceType } from '@prisma/client';

@Injectable()
export class RidesService {
  private readonly logger = new Logger(RidesService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private mapRide(ride: any) {
    return {
      id: ride.id,
      userId: ride.userId,
      userName: ride.user?.name ?? null,
      userPhone: ride.user?.phone ?? null,
      pickupLocation: ride.pickupLocation,
      destination: ride.destination,
      passengers: ride.passengers,
      serviceType: ride.serviceType,
      scheduledTime: ride.scheduledTime?.toISOString() ?? null,
      notes: ride.notes ?? null,
      status: ride.status,
      driverId: ride.driverId ?? null,
      driverName: ride.driver?.name ?? null,
      driverPhone: ride.driver?.phone ?? null,
      vehiclePlate: ride.driver?.vehiclePlate ?? null,
      vehicleModel: ride.driver?.vehicleModel ?? null,
      driverLatitude: ride.driver?.latitude ?? null,
      driverLongitude: ride.driver?.longitude ?? null,
      userLatitude: ride.user?.latitude ?? null,
      userLongitude: ride.user?.longitude ?? null,
      createdAt: ride.createdAt.toISOString(),
    };
  }

  async create(userId: string, dto: CreateRideDto) {
    const ride = await this.prisma.ride.create({
      data: {
        userId,
        pickupLocation: dto.pickupLocation,
        destination: dto.destination,
        passengers: dto.passengers,
        serviceType: dto.serviceType as ServiceType,
        scheduledTime: dto.scheduledTime ? new Date(dto.scheduledTime) : null,
        notes: dto.notes,
      },
      include: { user: true, driver: true },
    });
    // Award points
    await this.prisma.pointTransaction.create({
      data: { userId, points: 50, description: 'Ride requested' },
    }).catch(() => {});
    this.logger.log(`Ride created: ${ride.id}`);
    // Send push notification to all online drivers
    this.notifications.sendToAvailableDrivers(
      'Nova Corrida! / New Ride!',
      `${dto.pickupLocation} → ${dto.destination}`,
      { type: 'NEW_RIDE', rideId: ride.id },
    ).catch(() => {});
    return this.mapRide(ride);
  }

  /**
   * Re-notify available drivers about rides that are still PENDING.
   * Called periodically by an external cron job so drivers keep getting
   * the "chamada" alert (even when the app is closed / phone is locked)
   * until someone accepts the ride.
   */
  async notifyPendingRides() {
    // Only re-notify rides created within the last 10 minutes to avoid
    // alerting forever on stale/abandoned requests.
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const pending = await this.prisma.ride.findMany({
      where: {
        status: RideStatus.PENDING,
        driverId: null,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    for (const ride of pending ?? []) {
      await this.notifications.sendToAvailableDrivers(
        'Corrida a aguardar! / Ride waiting!',
        `${ride.pickupLocation} → ${ride.destination}`,
        { type: 'NEW_RIDE', rideId: ride.id },
      ).catch(() => {});
    }

    this.logger.log(`Re-notified drivers for ${pending?.length ?? 0} pending ride(s)`);
    return { notified: pending?.length ?? 0 };
  }

  async getDriverStats(driverId: string, period: string) {
    const now = new Date();
    let since: Date;

    if (period === 'week') {
      since = new Date(now);
      since.setDate(now.getDate() - 7);
      since.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      since = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // today
      since = new Date(now);
      since.setHours(0, 0, 0, 0);
    }

    // Count completed rides
    const completedRides = await this.prisma.ride.count({
      where: {
        driverId,
        status: RideStatus.COMPLETED,
        updatedAt: { gte: since },
      },
    });

    // Calculate online time from driver sessions
    const sessions = await this.prisma.driverSession.findMany({
      where: {
        driverId,
        startedAt: { gte: since },
      },
    });

    let totalOnlineMs = 0;
    for (const s of sessions) {
      const end = s.endedAt ?? now;
      totalOnlineMs += end.getTime() - s.startedAt.getTime();
    }

    const onlineHours = Math.floor(totalOnlineMs / 3600000);
    const onlineMinutes = Math.floor((totalOnlineMs % 3600000) / 60000);

    return {
      period,
      completedRides,
      onlineTimeHours: onlineHours,
      onlineTimeMinutes: onlineMinutes,
      totalOnlineMs,
    };
  }

  async findAll(user: { id: string; userType: string }, query: { status?: string; driverId?: string; limit?: number }) {
    const take = query.limit ?? 50;
    let where: any = {};

    if (user.userType === 'TOURIST') {
      where.userId = user.id;
    } else if (user.userType === 'DRIVER') {
      // Check if driver is online before showing PENDING rides
      if (query.status === 'PENDING') {
        const driver = await this.prisma.user.findUnique({ where: { id: user.id }, select: { isOnline: true } });
        if (!driver?.isOnline) {
          return { items: [] };
        }
        where.status = RideStatus.PENDING;
      } else if (query.driverId === 'me') {
        where.driverId = user.id;
        if (query.status) where.status = query.status as RideStatus;
      } else {
        where = { OR: [{ status: RideStatus.PENDING }, { driverId: user.id }] };
      }
    }
    // ADMIN sees all

    const rides = await this.prisma.ride.findMany({
      where,
      include: { user: true, driver: true },
      orderBy: { createdAt: 'desc' },
      take,
    });
    return { items: rides.map((r) => this.mapRide(r)) };
  }

  async findOne(id: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id }, include: { user: true, driver: true } });
    if (!ride) throw new NotFoundException('Ride not found');
    return this.mapRide(ride);
  }

  /** Lightweight tracking data - polled frequently */
  async getTracking(id: string, userId: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, latitude: true, longitude: true, locationUpdatedAt: true, phone: true } },
        driver: { select: { id: true, name: true, latitude: true, longitude: true, locationUpdatedAt: true, phone: true, vehiclePlate: true, vehicleModel: true } },
      },
    });
    if (!ride) throw new NotFoundException('Ride not found');
    // Verify the requesting user is part of this ride
    if (ride.userId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('Not authorized to track this ride');
    }
    return {
      id: ride.id,
      status: ride.status,
      pickupLocation: ride.pickupLocation,
      destination: ride.destination,
      driverId: ride.driverId ?? null,
      driverLatitude: ride.driver?.latitude ?? null,
      driverLongitude: ride.driver?.longitude ?? null,
      driverLocationUpdatedAt: ride.driver?.locationUpdatedAt?.toISOString() ?? null,
      driverName: ride.driver?.name ?? null,
      driverPhone: ride.driver?.phone ?? null,
      vehiclePlate: ride.driver?.vehiclePlate ?? null,
      vehicleModel: ride.driver?.vehicleModel ?? null,
      passengerLatitude: ride.user?.latitude ?? null,
      passengerLongitude: ride.user?.longitude ?? null,
      passengerLocationUpdatedAt: ride.user?.locationUpdatedAt?.toISOString() ?? null,
      passengerName: ride.user?.name ?? null,
      passengerPhone: ride.user?.phone ?? null,
    };
  }

  /** Update location for an active ride participant */
  async updateRideLocation(rideId: string, userId: string, body: { latitude: number; longitude: number }) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.userId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('Not part of this ride');
    }
    if (ride.status !== RideStatus.ACCEPTED && ride.status !== RideStatus.IN_PROGRESS) {
      throw new BadRequestException('Ride is not active');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { latitude: body.latitude, longitude: body.longitude, locationUpdatedAt: new Date() },
    });
    return { success: true };
  }

  /** Get current active ride for a user */
  async getActiveRide(userId: string, userType: string) {
    const where: any = {
      status: { in: [RideStatus.ACCEPTED, RideStatus.IN_PROGRESS] },
    };
    if (userType === 'DRIVER') {
      where.driverId = userId;
    } else {
      where.userId = userId;
    }
    const ride = await this.prisma.ride.findFirst({
      where,
      include: { user: true, driver: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (!ride) return null;
    return this.mapRide(ride);
  }

  async accept(id: string, driverId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.status !== RideStatus.PENDING) throw new BadRequestException('Ride is not pending');

    // Check if driver already has an active ride
    const activeRide = await this.prisma.ride.findFirst({
      where: {
        driverId,
        status: { in: [RideStatus.ACCEPTED, RideStatus.IN_PROGRESS] },
      },
    });
    if (activeRide) {
      throw new BadRequestException('Já tem uma corrida ativa. Conclua-a antes de aceitar outra. / You already have an active ride.');
    }

    const updated = await this.prisma.ride.update({
      where: { id },
      data: { driverId, status: RideStatus.ACCEPTED },
      include: { user: true, driver: true },
    });

    // Notify the tourist that a driver accepted
    this.notifications.sendToUser(
      ride.userId,
      'Corrida Aceite! / Ride Accepted!',
      `Motorista a caminho de ${ride.pickupLocation}`,
      { type: 'RIDE_ACCEPTED', rideId: id },
      { channelId: 'rides-chamada-v2', sound: 'chamada.mp3' },
    ).catch((e) => this.logger.error(`Push accept failed: ${e?.message}`));

    return this.mapRide(updated);
  }

  async start(id: string, driverId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.driverId !== driverId) throw new ForbiddenException('Not your ride');
    if (ride.status !== RideStatus.ACCEPTED) throw new BadRequestException('Ride must be ACCEPTED to start');

    const updated = await this.prisma.ride.update({
      where: { id },
      data: { status: RideStatus.IN_PROGRESS },
      include: { user: true, driver: true },
    });

    // Notify the tourist that the ride started
    this.notifications.sendToUser(
      ride.userId,
      'Corrida Iniciada! / Ride Started!',
      `A sua corrida de ${ride.pickupLocation} para ${ride.destination} iniciou`,
      { type: 'RIDE_STARTED', rideId: id },
      { channelId: 'rides-chamada-v2', sound: 'chamada.mp3' },
    ).catch((e) => this.logger.error(`Push start failed: ${e?.message}`));

    return this.mapRide(updated);
  }

  async complete(id: string, driverId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.driverId !== driverId) throw new ForbiddenException('Not your ride');
    if (ride.status !== RideStatus.ACCEPTED && ride.status !== RideStatus.IN_PROGRESS) {
      throw new BadRequestException('Ride is not active');
    }

    const updated = await this.prisma.ride.update({
      where: { id },
      data: { status: RideStatus.COMPLETED },
      include: { user: true, driver: true },
    });

    // Notify the tourist that the ride is complete
    this.notifications.sendToUser(
      ride.userId,
      'Corrida Concluida! / Ride Completed!',
      `Corrida para ${ride.destination} concluida. Obrigado!`,
      { type: 'RIDE_COMPLETED', rideId: id },
      { channelId: 'rides-chamada-v2', sound: 'chamada.mp3' },
    ).catch((e) => this.logger.error(`Push complete failed: ${e?.message}`));

    return this.mapRide(updated);
  }

  async cancel(id: string, userId: string, userType: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.userId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('Not your ride');
    }
    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel this ride');
    }

    const updated = await this.prisma.ride.update({
      where: { id },
      data: { status: RideStatus.CANCELLED },
      include: { user: true, driver: true },
    });

    // Notify the other party about cancellation
    const notifyUserId = ride.userId === userId ? ride.driverId : ride.userId;
    if (notifyUserId) {
      const cancelledBy = ride.userId === userId ? 'passageiro' : 'motorista';
      this.notifications.sendToUser(
        notifyUserId,
        'Corrida Cancelada / Ride Cancelled',
        `Corrida cancelada pelo ${cancelledBy}`,
        { type: 'RIDE_CANCELLED', rideId: id },
        { channelId: 'rides-chamada-v2', sound: 'chamada.mp3' },
      ).catch((e) => this.logger.error(`Push cancel failed: ${e?.message}`));
    }

    return this.mapRide(updated);
  }
}