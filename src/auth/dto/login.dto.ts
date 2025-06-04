import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Login użytkownika używany do uwierzytelnienia.',
    example: 'jankowalski',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Login nie może być pusty.' })
  login: string;

  @ApiProperty({
    description: 'Hasło użytkownika.',
    example: 'P@sswOrd123',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Hasło nie może być puste.' })
  password: string;
}