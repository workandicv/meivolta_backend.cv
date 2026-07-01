import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Boa Vista Music Festival' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ example: 'Festival de Música de Boa Vista' })
  @IsString()
  @IsNotEmpty()
  namePt: string;

  @ApiProperty({ example: 'Annual music festival on Boa Vista' })
  @IsString()
  descriptionEn: string;

  @ApiProperty({ example: 'Festival anual de música em Boa Vista' })
  @IsString()
  descriptionPt: string;

  @ApiProperty({ enum: ['FESTIVAL', 'MUSIC', 'CULTURAL', 'RELIGIOUS', 'SPORTS'] })
  @IsEnum(['FESTIVAL', 'MUSIC', 'CULTURAL', 'RELIGIOUS', 'SPORTS'])
  category: string;

  @ApiProperty({ example: '2026-08-15T18:00:00Z' })
  @IsString()
  date: string;

  @ApiPropertyOptional({ example: '2026-08-17T23:00:00Z' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ example: 'Sal Rei, Main Square' })
  @IsString()
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Gallery images (max 5)' })
  @IsOptional()
  gallery?: string[];
}
