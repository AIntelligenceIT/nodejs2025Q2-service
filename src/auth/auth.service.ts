import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt'; // Odkomentuj, jeśli będziesz używać bcrypt do hashowania haseł

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    // Tutaj zaimplementuj logikę walidacji użytkownika i generowania tokenu JWT
    const user = await this.usersService.findByLogin(loginDto.login); // Załóżmy, że masz taką metodę w UsersService

    if (user && await bcrypt.compare(loginDto.password, user.password)) {
      // Upewnij się, że user.password to zahashowane hasło z bazy danych
      // oraz że user.id i user.login to poprawne pola z Twojej encji użytkownika
      const payload = { login: user.login, sub: user.id, userId: user.id }; // Dopasuj payload do tego, co oczekuje JwtStrategy
      return {
        accessToken: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Nieprawidłowe dane logowania lub użytkownik nie istnieje.');
  }

  async signup(createUserDto: CreateUserDto) {
    // Tutaj zaimplementuj logikę tworzenia użytkownika, np. przez UsersService
    // Hashowanie hasła przed zapisem do bazy danych
    const saltRounds = 10; // Zalecana liczba rund dla bcrypt
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    return this.usersService.create({ ...createUserDto, password: hashedPassword });
  }
}