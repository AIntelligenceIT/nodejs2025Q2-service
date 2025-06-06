import { Controller, Post, Body, HttpStatus, HttpCode, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service'; // Załóżmy, że masz AuthService
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto'; // Jeśli signup jest tutaj
import { RefreshTokenDto } from './dto/refresh-token.dto'; // Importuj nowe DTO
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator'; // Importuj dekorator Public

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() // Oznacz ten endpoint jako publiczny
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logowanie użytkownika', description: 'Uwierzytelnia użytkownika i zwraca token dostępowy.' })
  @ApiBody({
    type: LoginDto,
    description: 'Dane logowania użytkownika.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pomyślnie zalogowano. Zwraca token.' /* type: AuthTokenResponseDto */ })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Nieprawidłowe dane logowania.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Nieprawidłowe dane wejściowe.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto); // Przykładowe wywołanie serwisu
  }

  // Jeśli endpoint /auth/signup również jest w tym kontrolerze:
  @Public() // Oznacz ten endpoint jako publiczny
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Rejestracja nowego użytkownika', description: 'Tworzy nowe konto użytkownika.' })
  @ApiBody({ type: CreateUserDto, description: 'Dane do rejestracji nowego użytkownika.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Użytkownik pomyślnie zarejestrowany.' /* type: UserResponseDto */ })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Nieprawidłowe dane lub użytkownik już istnieje.' })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto); // Przykładowe wywołanie serwisu
  }

  @Public() // Endpoint odświeżania tokenu często jest publiczny
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Odświeżanie tokenów', description: 'Używa tokenu odświeżającego do uzyskania nowej pary tokenów dostępowych.' })
  @ApiBody({ type: RefreshTokenDto, description: 'Token odświeżający.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pomyślnie odświeżono tokeny.' /* type: AuthTokenResponseDto */ })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Nieprawidłowy lub wygasły token odświeżający.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Brak tokenu odświeżającego w ciele żądania.' }) // Obsłużone przez ValidationPipe
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    // ValidationPipe obsłuży 400 BAD_REQUEST jeśli refreshToken brakuje lub nie jest stringiem.
    // AuthService.refreshTokens powinien rzucać UnauthorizedException lub ForbiddenException
    // w zależności od błędu tokena (np. nieprawidłowy format vs wygasły/nieznany token).
    // NestJS automatycznie przetłumaczy te wyjątki na statusy 401/403.
    // Test "should fail with 401 (no refresh token)" może wymagać dostosowania oczekiwanego statusu na 400, jeśli ValidationPipe jest globalny.
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}