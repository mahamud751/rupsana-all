import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';

export const ROLES_KEY = 'roles';

/** Requires a valid access token; optionally restricts to given roles. */
export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Missing or invalid access token' }),
    ...(roles.length
      ? [
          ApiForbiddenResponse({
            description: `Requires role: ${roles.join(', ')}`,
          }),
        ]
      : []),
  );
}

/** Shortcut for admin-only endpoints. */
export const AdminOnly = () => Auth(Role.ADMIN);
