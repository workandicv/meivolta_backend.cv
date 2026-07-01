import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({ example: 'RESTAURANT' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'Restaurante Morabeza' })
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @ApiProperty({ example: 'Hotel Dunas' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiPropertyOptional({ example: '2x Cachupa, 1x Agua' })
  @IsOptional()
  @IsString()
  itemsDescription?: string;
}
