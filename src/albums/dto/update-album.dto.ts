import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';

export class UpdateAlbumDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year?: number;

  @IsOptional()
  @IsString()
  artistId?: string | null;
} 