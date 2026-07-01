import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-here' })
  @IsString()
  @IsNotEmpty()
  excursionId: string;

  @ApiProperty({ example: '2025-07-20T00:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  numberOfPeople: number;

  @ApiPropertyOptional({ example: 'Portugues' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'Hotel Riu Karamboa' })
  @IsOptional()
  @IsString()
  accommodation?: string;

  @ApiPropertyOptional({ example: 'João' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Silva' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+238' })
  @IsOptional()
  @IsString()
  phoneCode?: string;

  @ApiPropertyOptional({ example: '9876543' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  numAdults?: number;

  @ApiPropertyOptional({ example: 1, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  numChildren?: number;

  @ApiPropertyOptional({ example: 'Precisamos de cadeira para criança' })
  @IsOptional()
  @IsString()
  observations?: string;
}
