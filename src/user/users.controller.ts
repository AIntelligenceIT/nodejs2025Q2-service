import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth() // Wskazuje, że endpointy w tym kontrolerze wymagają autoryzacji Bearer Token
@Controller('user') // Zmieniamy na 'user', aby pasowało do test/endpoints.ts
// @UseGuards(JwtAuthGuard) // Usunięto, ponieważ globalny strażnik jest włączony
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns an array of users.',
    // Tutaj można dodać `type: [UserResponseDto]` jeśli masz DTO dla odpowiedzi
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user (UUID format)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the user.',
    // Tutaj można dodać `type: UserResponseDto]` jeśli masz DTO dla odpowiedzi
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Data to create a new user.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    // Tutaj można dodać `type: UserResponseDto]` jeśli masz DTO dla odpowiedzi
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid input data (e.g., missing login/password, or user already exists).',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    // Walidacja pól (login, password) powinna być obsłużona przez
    // class-validator w CreateUserDto i globalny ValidationPipe.
    // Poniższe sprawdzenie jest redundantne, jeśli DTO jest poprawnie zdefiniowane.
    // if (!createUserDto.login || !createUserDto.password) {
    //   throw new BadRequestException('Login and password are required');
    // }
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user (UUID format)',
    type: String,
  })
  @ApiBody({ type: UpdatePasswordDto, description: 'Old and new password.' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password updated successfully.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or invalid UUID format.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    // Walidacja pól (oldPassword, newPassword) powinna być obsłużona przez
    // class-validator w UpdatePasswordDto i globalny ValidationPipe.
    // Poniższe sprawdzenie jest redundantne, jeśli DTO jest poprawnie zdefiniowane.
    // if (!updatePasswordDto.oldPassword || !updatePasswordDto.newPassword) {
    //   throw new BadRequestException('Old password and new password are required');
    // }
    return this.usersService.update(id, updatePasswordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user (UUID format)',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID format.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
