import { IsString, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9@$!%*?&]{3,30}$/, {
    message: 'Nowe hasło musi zawierać od 3 do 30 znaków i może składać się z liter, cyfr oraz znaków specjalnych (np. @$!%*?&).',
  })
  newPassword: string;
} 