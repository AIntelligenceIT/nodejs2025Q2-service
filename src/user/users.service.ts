import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User, UserWithoutPassword } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt'; // Import bcrypt

@Injectable()
export class UsersService {
  private users: User[] = []; // In-memory storage

  findAll(): UserWithoutPassword[] {
    return this.users.map(({ password: _, ...user }) => user);
  }

  findOne(id: string): UserWithoutPassword {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserWithoutPassword> {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    const user = this.users[userIndex];
    if (!(await bcrypt.compare(updatePasswordDto.oldPassword, user.password))) {
      // Użyj bcrypt.compare do porównania hasła
      throw new ForbiddenException('Old password is wrong');
    }

    const saltRounds = parseInt(process.env.CRYPT_SALT || '10', 10); // Preferuj CRYPT_SALT, potem CRYPT_SALT, potem 10
    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      saltRounds,
    );
    const updatedUser: User = {
      ...user,
      password: hashedNewPassword, // Zapisz zahashowane nowe hasło
      version: user.version + 1,
      updatedAt: Date.now(),
    };

    this.users[userIndex] = updatedUser;
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  remove(id: string): void {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }
    this.users.splice(userIndex, 1);
  }

  clearUsers(): void {
    this.users = []; // Metoda do czyszczenia danych w pamięci (dla testów)
  }
}
