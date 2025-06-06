import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common'; // Import NotFoundException and ForbiddenException
import { UsersService } from '../user/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserWithoutPassword } from '../user/interfaces/user.interface'; // Import UserWithoutPassword
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto'; // Import CreateUserDto
import * as bcrypt from 'bcrypt'; // Odkomentuj, jeśli będziesz używać bcrypt do hashowania haseł
import { ConfigService } from '@nestjs/config'; // Potrzebne do odczytu konfiguracji JWT

// Interfejsy dla payloadu tokenów i odpowiedzi
export interface TokenPayload {
  userId: string;
  login: string;
}
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService, // Wstrzyknij ConfigService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthTokens> {
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
      return this._generateTokens(user);
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

  async refreshTokens(token: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET_REFRESH_KEY'),
      });

      const user = await this.usersService.findOne(payload.userId); // Załóżmy, że UsersService ma metodę findOne
      if (!user) {
        // Ten przypadek jest mało prawdopodobny, jeśli token jest ważny, ale warto go obsłużyć
        throw new ForbiddenException('Użytkownik powiązany z tokenem nie istnieje.');
      }
      
      // Opcjonalnie: sprawdź, czy token odświeżający nie jest na czarnej liście (jeśli implementujesz taką logikę)

      return this._generateTokens(user);
    } catch (error) {
      // Przechwytuje błędy JWT (np. wygasły, niepoprawny format) oraz błąd, gdy użytkownik nie zostanie znaleziony
      throw new ForbiddenException('Nieprawidłowy lub wygasły token odświeżający.');
    }
  }

  private async _generateTokens(user: UserWithoutPassword): Promise<AuthTokens> {
    const payload: TokenPayload = { userId: user.id, login: user.login };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('TOKEN_EXPIRE_TIME') || '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH_KEY'),
      expiresIn: this.configService.get<string>('TOKEN_REFRESH_EXPIRE_TIME') || '24h',
    });
    return { accessToken, refreshToken };
  }
}