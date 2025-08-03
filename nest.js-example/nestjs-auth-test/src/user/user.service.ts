import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  createUser(user: UserDto) {
    return this.userRepository.save(user);
  }

  async getUser(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateUser(email: string, userDto: UpdateUserDto) {
    const user = await this.getUser(email);

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    user.username = userDto.username ?? user.username;
    user.password = userDto.password ?? user.password;

    return this.userRepository.save(user);
  }

  async deleteUser(email: string) {
    return this.userRepository.delete({ email });
  }
}
