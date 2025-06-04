import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'User login credential.',
    example: 'testuser',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    description: 'User password credential.',
    example: 'password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
} 