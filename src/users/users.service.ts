import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User, UserWithoutPassword } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): UserWithoutPassword[] {
    return this.users.map((u) => {
      const copy = { ...u } as any;
      delete copy.password;
      return copy;
    });
  }

  findOne(id: string): UserWithoutPassword {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const copy = { ...user } as any;
    delete copy.password;
    return copy;
  }

  findByLogin(login: string): User {
    const user = this.users.find((user) => user.login === login);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  create(createUserDto: CreateUserDto): UserWithoutPassword {
    const user: User = {
      id: randomUUID(),
      ...createUserDto,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.users.push(user);
    const copy = { ...user } as any;
    delete copy.password;
    return copy;
  }

  update(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): UserWithoutPassword {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    const user = this.users[userIndex];
    if (user.password !== updatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }

    const updatedUser: User = {
      ...user,
      password: updatePasswordDto.newPassword,
      version: user.version + 1,
      updatedAt: Date.now(),
    };

    this.users[userIndex] = updatedUser;
    const copy = { ...updatedUser } as any;
    delete copy.password;
    return copy;
  }

  remove(id: string): void {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    this.users.splice(userIndex, 1);
  }
}
