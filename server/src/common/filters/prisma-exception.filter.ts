import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

/** Turns common database errors into clean HTTP responses. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const map: Record<string, [number, string]> = {
      P2002: [HttpStatus.CONFLICT, 'A record with this value already exists'],
      P2025: [HttpStatus.NOT_FOUND, 'Record not found'],
      P2003: [HttpStatus.BAD_REQUEST, 'Related record does not exist'],
    };
    const [statusCode, message] = map[error.code] ?? [
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Database error',
    ];
    res.status(statusCode).json({ statusCode, message, code: error.code });
  }
}
