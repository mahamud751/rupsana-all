import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizePhone } from '../common/utils.js';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto.js';

export const userSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async issue(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: userSelect,
    });
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, role: user.role }),
      user,
    };
  }

  async register(dto: RegisterDto) {
    const phone = normalizePhone(dto.phone);
    const email = dto.email?.trim().toLowerCase() || null;
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (exists) {
      throw new ConflictException(
        exists.phone === phone
          ? 'An account with this phone number already exists'
          : 'An account with this email already exists',
      );
    }
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        phone,
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        notifications: {
          create: [
            {
              title: 'Welcome to Rupsuhana ✨',
              body: 'Discover bridal jewellery, makeup and more — delivered across Bangladesh.',
            },
            {
              title: 'Bridal offer: 10% off',
              body: 'Use code BRIDE10 at checkout to get 10% off your order.',
            },
          ],
        },
      },
    });
    return this.issue(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: normalizePhone(dto.phone) },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Incorrect phone number or password');
    }
    return this.issue(user.id);
  }

  me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: userSelect,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const email =
      dto.email === undefined
        ? undefined
        : dto.email.trim().toLowerCase() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('email must be an email');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name?.trim(), email },
      select: userSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });
    return { success: true };
  }
}
