import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  video?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString() // Could be URL
  url?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  publishStatus?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  categoryIds?: string[];
}

export class UpdateGameDto extends PartialType(CreateGameDto) {}
