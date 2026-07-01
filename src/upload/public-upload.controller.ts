import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { generatePresignedUploadUrl, getFileUrl } from '../lib/s3';

/**
 * Public (unauthenticated) upload endpoints used during signup, where the
 * user does not yet have an auth token. Restricted to public avatar images.
 */
@ApiTags('Upload')
@Controller('api/public/upload')
export class PublicUploadController {
  private readonly logger = new Logger(PublicUploadController.name);

  @Post('presigned')
  @ApiOperation({ summary: 'Get presigned URL for a public avatar upload (no auth)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        contentType: { type: 'string' },
      },
    },
  })
  async getPresignedUrl(@Body() body: { fileName: string; contentType: string }) {
    this.logger.log(`Public presigned avatar upload for: ${body?.fileName}`);
    const result = await generatePresignedUploadUrl(
      body.fileName,
      body.contentType,
      true,
    );
    return result;
  }

  @Post('complete')
  @ApiOperation({ summary: 'Confirm a public avatar upload and get public URL (no auth)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cloud_storage_path: { type: 'string' },
        contentType: { type: 'string' },
      },
    },
  })
  async confirmUpload(@Body() body: { cloud_storage_path: string; contentType: string }) {
    const url = await getFileUrl(body.cloud_storage_path, body.contentType, true);
    return { url, cloud_storage_path: body.cloud_storage_path };
  }
}
