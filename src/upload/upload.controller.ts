import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  generatePresignedUploadUrl,
  getFileUrl,
  deleteFile,
  initiateMultipartUpload,
  getPresignedUrlForPart,
  completeMultipartUpload,
} from '../lib/s3';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  @Post('upload/presigned')
  @ApiOperation({ summary: 'Get presigned URL for single-part upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        contentType: { type: 'string' },
        isPublic: { type: 'boolean' },
      },
    },
  })
  async getPresignedUrl(
    @Body() body: { fileName: string; contentType: string; isPublic?: boolean },
  ) {
    this.logger.log(`Generating presigned upload URL for: ${body.fileName}`);
    const result = await generatePresignedUploadUrl(
      body.fileName,
      body.contentType,
      body.isPublic ?? true,
    );
    return result;
  }

  @Post('upload/complete')
  @ApiOperation({ summary: 'Confirm upload and get public URL' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cloud_storage_path: { type: 'string' },
        contentType: { type: 'string' },
        isPublic: { type: 'boolean' },
      },
    },
  })
  async confirmUpload(
    @Body() body: { cloud_storage_path: string; contentType: string; isPublic?: boolean },
  ) {
    const url = await getFileUrl(
      body.cloud_storage_path,
      body.contentType,
      body.isPublic ?? true,
    );
    return { url, cloud_storage_path: body.cloud_storage_path };
  }

  @Post('upload/multipart/initiate')
  @ApiOperation({ summary: 'Initiate multipart upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        contentType: { type: 'string' },
        isPublic: { type: 'boolean' },
      },
    },
  })
  async initiateMultipart(
    @Body() body: { fileName: string; contentType: string; isPublic?: boolean },
  ) {
    return initiateMultipartUpload(body.fileName, body.contentType, body.isPublic ?? true);
  }

  @Post('upload/multipart/part')
  @ApiOperation({ summary: 'Get presigned URL for a part' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cloud_storage_path: { type: 'string' },
        uploadId: { type: 'string' },
        partNumber: { type: 'number' },
      },
    },
  })
  async getPartUrl(
    @Body() body: { cloud_storage_path: string; uploadId: string; partNumber: number },
  ) {
    const url = await getPresignedUrlForPart(body.cloud_storage_path, body.uploadId, body.partNumber);
    return { url };
  }

  @Post('upload/multipart/complete')
  @ApiOperation({ summary: 'Complete multipart upload' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cloud_storage_path: { type: 'string' },
        uploadId: { type: 'string' },
        parts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ETag: { type: 'string' },
              PartNumber: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async completeMultipart(
    @Body() body: { cloud_storage_path: string; uploadId: string; parts: { ETag: string; PartNumber: number }[] },
  ) {
    await completeMultipartUpload(body.cloud_storage_path, body.uploadId, body.parts);
    return { cloud_storage_path: body.cloud_storage_path };
  }

  @Delete('files/by-path')
  @ApiOperation({ summary: 'Delete a file by cloud storage path' })
  @ApiQuery({ name: 'path', required: true })
  async deleteByPath(@Query('path') path: string) {
    await deleteFile(path);
    return { deleted: true };
  }
}
