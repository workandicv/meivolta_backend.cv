import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Santa Monica Beach' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ example: 'Praia de Santa Monica' })
  @IsString()
  @IsNotEmpty()
  namePt: string;

  @ApiProperty({ example: 'The longest beach...' })
  @IsString()
  @IsNotEmpty()
  descriptionEn: string;

  @ApiProperty({ example: 'A praia mais longa...' })
  @IsString()
  @IsNotEmpty()
  descriptionPt: string;

  @ApiProperty({ enum: ['BEACH', 'RESTAURANT'] })
  @IsEnum(['BEACH', 'RESTAURANT'])
  type: 'BEACH' | 'RESTAURANT';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Gallery images (max 5)' })
  @IsOptional()
  gallery?: string[];

  @ApiPropertyOptional({ example: 'South coast, 25min from Sal Rei' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: { cuisine: 'Cape Verdean', hours: '12:00-22:00' } })
  @IsOptional()
  @IsObject()
  detailsEn?: Record<string, any>;

  @ApiPropertyOptional({ example: { cuisine: 'Cabo-verdiana', hours: '12:00-22:00' } })
  @IsOptional()
  @IsObject()
  detailsPt?: Record<string, any>;
}

export class UpdatePlaceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nameEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() namePt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionPt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional() @IsOptional() gallery?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() detailsEn?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() detailsPt?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
