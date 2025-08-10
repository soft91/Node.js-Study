import { HttpException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserDto } from 'src/user/user.dto';
import * as bcrypt from 'bcrypt'; // ✅ 수정된 import

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(userDto: UserDto) {
    const user = await this.userService.getUser(userDto.email as string);
    if (user) {
      throw new HttpException('User already exists', 400);
    }

    if (!userDto.password) {
      throw new HttpException('Password is required', 400); // ✅ password 유효성 체크
    }

    const encryptedPassword = bcrypt.hashSync(userDto.password, 10);

    try {
      const user = await this.userService.createUser({
        ...userDto,
        password: encryptedPassword,
      });

      user.password = user.password ?? undefined; // ✅ 원래 password 제거
      return user;
    } catch (error) {
      throw new HttpException('Error creating user', 500);
    }
  }
}
