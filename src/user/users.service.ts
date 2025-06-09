import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserWithoutPassword } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt'; // Import bcrypt
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.toResponse(user));
  }

  async findOne(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toResponse(user);
  }

  async findByLogin(login: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const saltRounds = parseInt(process.env.CRYPT_SALT || '10', 10); // Ensure CRYPT_SALT is a string in .env
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    return this.toResponse(savedUser);
  }

  async update(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserWithoutPassword> {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(updatePasswordDto.oldPassword, user.password))) {
      // Użyj bcrypt.compare do porównania hasła
      throw new ForbiddenException('Old password is wrong');
    }

    const saltRounds = parseInt(process.env.CRYPT_SALT || '10', 10);
    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      saltRounds,
    );

    user.password = hashedNewPassword;
    // TypeORM automatycznie zaktualizuje `version` i `updatedAt`
    const updatedUser = await this.userRepository.save(user);
    return this.toResponse(updatedUser);
  }

  async remove(id: string): Promise<void> {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  // Metoda pomocnicza do mapowania encji na DTO odpowiedzi (bez hasła)
  private toResponse(user: UserEntity): UserWithoutPassword {
    const { password, ...rest } = user;
    return rest;
  }
}
