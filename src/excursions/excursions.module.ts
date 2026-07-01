import { Module } from '@nestjs/common';
import { ExcursionsController } from './excursions.controller';
import { ExcursionsService } from './excursions.service';

@Module({
  controllers: [ExcursionsController],
  providers: [ExcursionsService],
})
export class ExcursionsModule {}
