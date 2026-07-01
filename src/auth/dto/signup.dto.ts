import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '+238 999 0000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: ['TOURIST', 'DRIVER', 'GUIDE'], example: 'TOURIST' })
  @IsEnum(['TOURIST', 'DRIVER', 'GUIDE'])
  userType: 'TOURIST' | 'DRIVER' | 'GUIDE';

  @ApiPropertyOptional({ example: 'DL-12345' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: 'BV-1234-AB' })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @ApiPropertyOptional({ example: 'Toyota Hilux 2024' })
  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @ApiPropertyOptional({ example: 'https://www.shutterstock.com/image-vector/user-profile-avatar-icon-representing-260nw-2726327967.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
