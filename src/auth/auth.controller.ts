import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service'; // Załóżmy, że masz AuthService
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto'; // Jeśli signup jest tutaj
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
}