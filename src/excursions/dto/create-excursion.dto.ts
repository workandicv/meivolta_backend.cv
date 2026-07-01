import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsBoolean } from 'class-validator';

export class CreateExcursionDto {
  @ApiProperty({ example: 'Beach Hopping Tour' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ example: 'Tour das Praias' })
  @IsString()
  @IsNotEmpty()
  namePt: string;

  @ApiProperty({ example: 'Discover the most beautiful beaches...' })
  @IsString()
  @IsNotEmpty()
  descriptionEn: string;

  @ApiProperty({ example: 'Descubra as praias mais bonitas...' })
  @IsString()
  @IsNotEmpty()
  descriptionPt: string;

  @ApiProperty({ example: 4500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '5 hours' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ enum: ['PICKUP_4X4', 'BEACH_TOUR', 'CULTURAL', 'TURTLES', 'BOAT', 'DIVING', 'FISHING', 'DESERT_VIANA', 'PHOTO_TOUR'] })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  maxCapacity: number;

  @ApiPropertyOptional({ example: 'https://www.jotform.com/blog/wp-content/uploads/2015/10/pexels-photo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['https://4.img-dpreview.com/files/p/TS600x600~sample_galleries/5226835446/9178391968.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Painted_turtle_%28Chrysemys_picta%29_Madden_Haag.jpg/1280px-Painted_turtle_%28Chrysemys_picta%29_Madden_Haag.jpg'], description: 'Gallery images (max 5)' })
  @IsOptional()
  gallery?: string[];
}

export class UpdateExcursionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nameEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() namePt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionPt?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() price?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() duration?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() maxCapacity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional() @IsOptional() gallery?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
