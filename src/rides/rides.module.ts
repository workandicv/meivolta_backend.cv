import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RidesController } from './rides.controller';
import { RidesCronController } from './rides-cron.controller';
import { RidesService } from './rides.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule, ConfigModule],
  controllers: [RidesController, RidesCronController],
  providers: [RidesService],
})
export class RidesModule {}
