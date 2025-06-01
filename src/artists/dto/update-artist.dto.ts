import { IsString, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdateArtistDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsBoolean()
  grammy: boolean;
} 