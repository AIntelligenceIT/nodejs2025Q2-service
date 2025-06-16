import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  Min,
  IsInt,
} from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({
    example: 'The Song Title',
    description: 'The name of the track',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 210,
    description: 'Duration of the track in seconds',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({
    example: 'f102d7a7-a663-4e50-904b-03006f50a75a',
    description: 'ID of the artist (UUID v4)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  artistId: string | null;

  @ApiPropertyOptional({
    example: 'b3d5c8a0-9b1e-4c7f-8b1a-2e5c6d7f8a9b',
    description: 'ID of the album (UUID v4)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  albumId: string | null;
}
