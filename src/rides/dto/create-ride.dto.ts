import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, IsDateString } from 'class-validator';

export class CreateRideDto {
  @ApiProperty({ example: 'Hotel Riu Karamboa' })
  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @ApiProperty({ example: 'Santa Monica Beach' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 8 })
  @IsInt()
  @Min(1)
  @Max(8)
  passengers: number;

  @ApiProperty({ enum: ['TAXI', 'TRANSFER'], example: 'TAXI' })
  @IsEnum(['TAXI', 'TRANSFER'])
  serviceType: 'TAXI' | 'TRANSFER';

  @ApiPropertyOptional({ example: '2025-06-15T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @ApiPropertyOptional({ example: 'Please bring a child seat' })
  @IsOptional()
  @IsString()
  notes?: string;
}
