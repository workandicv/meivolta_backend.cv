import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async registerPushToken(userId: string, token: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });
    this.logger.log(`Push token registered for user ${userId}`);
    return { success: true };
  }

  async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
    options?: { channelId?: string; sound?: string },
  ) {
    if (!expoPushToken?.startsWith?.('ExponentPushToken')) {
      this.logger.warn(`Invalid push token: ${expoPushToken}`);
      return;
    }

    const message: any = {
      to: expoPushToken,
      sound: options?.sound ?? 'default',
      title,
      body,
      data: data ?? {},
      priority: 'high' as const,
    };
    if (options?.channelId) {
      message.channelId = options.channelId;
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      const result = await response.json();
      if (result?.data?.status === 'error') {
        this.logger.error(`Push notification error: ${result?.data?.details?.error}`);
        if (result?.data?.details?.error === 'DeviceNotRegistered') {
          // Token is no longer valid — clear it
          await this.prisma.user.updateMany({
            where: { expoPushToken },
            data: { expoPushToken: null },
          });
        }
      } else {
        this.logger.log(`Push notification sent: ${title}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send push notification: ${err?.message}`);
    }
  }

  async sendToUser(userId: string, title: string, body: string, data?: Record<string, any>, options?: { channelId?: string; sound?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });
    if (user?.expoPushToken) {
      await this.sendPushNotification(user.expoPushToken, title, body, data, options);
    }
  }

  async sendToAvailableDrivers(title: string, body: string, data?: Record<string, any>) {
    // Get IDs of drivers who already have an active ride
    const busyRides = await this.prisma.ride.findMany({
      where: {
        status: { in: ['ACCEPTED', 'IN_PROGRESS'] },
        driverId: { not: null },
      },
      select: { driverId: true },
    });
    const busyDriverIds = [...new Set((busyRides ?? []).map((r) => r.driverId).filter(Boolean))] as string[];

    const drivers = await this.prisma.user.findMany({
      where: {
        userType: { in: ['DRIVER', 'GUIDE'] },
        isOnline: true,
        expoPushToken: { not: null },
        ...(busyDriverIds.length > 0 ? { id: { notIn: busyDriverIds } } : {}),
      },
      select: { expoPushToken: true },
    });

    const tokens = drivers
      ?.map?.((d) => d?.expoPushToken)
      ?.filter?.((t): t is string => !!t) ?? [];

    // Batch send (up to 100 per request)
    const batches: string[][] = [];
    for (let i = 0; i < tokens.length; i += 100) {
      batches.push(tokens.slice(i, i + 100));
    }

    for (const batch of batches) {
      const messages = batch.map((token) => {
        const msg: any = {
          to: token,
          sound: 'chamada.mp3',
          title,
          body,
          data: data ?? {},
          priority: 'high' as const,
          channelId: 'rides-chamada-v2',
        };
        return msg;
      });

      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });
      } catch (err: any) {
        this.logger.error(`Batch push failed: ${err?.message}`);
      }
    }
  }
}
