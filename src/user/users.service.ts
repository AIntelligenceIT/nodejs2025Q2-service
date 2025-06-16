import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UserWithoutPassword } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
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
    const { login, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { login },
    });
    if (existingUser) {
      throw new ConflictException(`User with login '${login}' already exists`);
    }

    const saltRounds = parseInt(process.env.CRYPT_SALT || '10', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    return this.toResponse(savedUser);
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(updatePasswordDto.oldPassword, user.password))) {
      throw new ForbiddenException('Old password is wrong');
    }

    const saltRounds = parseInt(process.env.CRYPT_SALT || '10', 10);
    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      saltRounds,
    );

    user.password = hashedNewPassword;
    const updatedUser = await this.userRepository.save(user);
    return this.toResponse(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  private toResponse(user: UserEntity): UserWithoutPassword {
    const { password: _, ...restOfUser } = user;
    return {
      ...restOfUser,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }
}
