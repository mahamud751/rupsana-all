import { Role } from '../../generated/prisma/enums.js';

export class UserEntity {
  id: string;
  name: string;
  /** Mobile number in 01XXXXXXXXX form */
  phone: string;
  email: string | null;
  role: Role;
  createdAt: Date;
}

export class AuthResponseEntity {
  /** JWT to send as `Authorization: Bearer <token>` */
  accessToken: string;
  user: UserEntity;
}
