import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RidesModule } from './rides/rides.module';
import { ExcursionsModule } from './excursions/excursions.module';
import { BookingsModule } from './bookings/bookings.module';
import { PlacesModule } from './places/places.module';
import { AdminModule } from './admin/admin.module';
import { RentalsModule } from './rentals/rentals.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { PointsModule } from './points/points.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReservationsModule } from './reservations/reservations.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    RidesModule,
    ExcursionsModule,
    BookingsModule,
    PlacesModule,
    AdminModule,
    RentalsModule,
    DeliveriesModule,
    PointsModule,
    EventsModule,
    ChatModule,
    RatingsModule,
    ReservationsModule,
    UploadModule,
    NotificationsModule,
  ],
})
export class AppModule {}
