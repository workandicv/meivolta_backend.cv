import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { PublicUploadController } from './public-upload.controller';

@Module({
  controllers: [UploadController, PublicUploadController],
})
export class UploadModule {}
