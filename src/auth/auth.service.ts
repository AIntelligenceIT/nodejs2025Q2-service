import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common'; // Import NotFoundException
import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserWithoutPassword } from '../user/interfaces/user.interface'; // Import UserWithoutPassword
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto'; // Import CreateUserDto
import * as bcrypt from 'bcrypt'; // Odkomentuj, jeśli będziesz używać bcrypt do hashowania haseł

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    let user;
    try {
      user = await this.usersService.findByLogin(loginDto.login); // Załóżmy, że masz taką metodę w UsersService
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Nieprawidłowe dane logowania lub użytkownik nie istnieje.'); // Zmień 404 na 401
      }
      throw error; // Rzuć inne błędy dalej
    }

    if (user && await bcrypt.compare(loginDto.password, user.password)) {
      // Upewnij się, że user.password to zahashowane hasło z bazy danych
      // oraz że user.id i user.login to poprawne pola z Twojej encji użytkownika
      const payload = { login: user.login, sub: user.id, userId: user.id }; // Payload dla tokenów

      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.TOKEN_EXPIRE_TIME || '1h', // Użyj zmiennej środowiskowej
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY, // Użyj innego klucza dla tokenu odświeżającego
        expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME || '24h', // Użyj zmiennej środowiskowej
      });

      return {
        accessToken,
        refreshToken,
      };
    }
    throw new UnauthorizedException('Nieprawidłowe dane logowania lub użytkownik nie istnieje.');
  }

  async signup(createUserDto: CreateUserDto): Promise<UserWithoutPassword> { // Dodano typ zwracany
    // Tutaj zaimplementuj logikę tworzenia użytkownika, np. przez UsersService
    // Hashowanie hasła przed zapisem do bazy danych
    const saltRounds = parseInt(process.env.CRYPT_SALT || '10', 10); // Użyj zmiennej środowiskowej
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds); // Hashowanie hasła
    return this.usersService.create({ ...createUserDto, password: hashedPassword });
  }
}