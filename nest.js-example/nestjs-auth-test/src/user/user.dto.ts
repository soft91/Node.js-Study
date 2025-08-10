import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  username: string;

  @IsEmail()
  email?: string;

  @IsString()
  password: string;
}

export class UpdateUserDto {
  @IsString()
  username?: string;

  @IsString()
  password?: string;
}
