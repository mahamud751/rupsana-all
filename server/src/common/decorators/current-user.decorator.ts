import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Role } from '../../generated/prisma/client.js';

export type AuthUser = { id: string; role: Role };

/** The signed-in user from the JWT (set by JwtAuthGuard). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest().user,
);
