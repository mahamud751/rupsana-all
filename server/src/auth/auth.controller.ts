import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Auth } from '../common/decorators/auth.decorator.js';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import { AuthService } from './auth.service.js';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto.js';
import { AuthResponseEntity, UserEntity } from './entities/user.entity.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create a customer account' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseEntity> {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Sign in with phone number and password' })
  login(@Body() dto: LoginDto): Promise<AuthResponseEntity> {
    return this.auth.login(dto);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get the signed-in user' })
  me(@CurrentUser() user: AuthUser): Promise<UserEntity> {
    return this.auth.me(user.id);
  }

  @Patch('me')
  @Auth()
  @ApiOperation({ summary: 'Update name or email' })
  update(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserEntity> {
    return this.auth.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @Auth()
  @ApiOperation({ summary: 'Change password' })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(user.id, dto);
  }
}
