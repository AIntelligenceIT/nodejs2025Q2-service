import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unikalny login użytkownika.',
    example: 'jankowalski',
    minLength: 3,
    maxLength: 255,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  login: string;

  @ApiProperty({
    description:
      'Hasło użytkownika. Musi zawierać od 3 do 30 znaków, w tym litery, cyfry i/lub znaki specjalne (np. @$!%*?&).',
    example: 'P@sswOrd123',
    pattern: '^[a-zA-Z0-9@$!%*?&]{3,30}$', // Zaktualizowany wzorzec dopuszczający wybrane znaki specjalne
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  // Zaktualizowany regex, aby dopuszczał litery, cyfry oraz podstawowe znaki specjalne
  @Matches(/^[a-zA-Z0-9@$!%*?&]{3,30}$/, {
    message: 'Hasło musi zawierać od 3 do 30 znaków i może składać się z liter, cyfr oraz znaków specjalnych (np. @$!%*?&).',
  })
  password: string;
} 