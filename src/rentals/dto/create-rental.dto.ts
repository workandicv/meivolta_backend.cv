import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRentalDto {
  @ApiProperty({ example: 'SUV' })
  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @ApiProperty({ example: '15/07/2026' })
  @IsString()
  @IsNotEmpty()
  pickupDate: string;

  @ApiPropertyOptional({ example: '20/07/2026' })
  @IsOptional()
  @IsString()
  returnDate?: string;

  @ApiPropertyOptional({ example: 'Airport' })
  @IsOptional()
  @IsString()
  deliveryLocation?: string;
}
