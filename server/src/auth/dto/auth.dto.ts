import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsBdPhone } from '../../common/decorators/is-bd-phone.decorator.js';

export class RegisterDto {
  /** Customer's full name */
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsBdPhone()
  phone: string;

  /** Optional email address */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** At least 6 characters */
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}

export class LoginDto {
  @IsBdPhone()
  phone: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  /** Set to an empty string to remove the email */
  @IsOptional()
  @IsString()
  email?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  /** At least 6 characters */
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  newPassword: string;
}
