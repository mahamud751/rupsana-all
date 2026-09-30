import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';
import { normalizePhone } from '../utils.js';

/**
 * Bangladeshi mobile number. Accepts "+880 1712-345678", "8801712345678",
 * "01712345678" etc. and normalises it to "01712345678" before validating.
 */
export const IsBdPhone = () =>
  applyDecorators(
    ApiProperty({
      example: '01712345678',
      description: 'Bangladeshi mobile number',
    }),
    Transform(({ value }) =>
      typeof value === 'string' ? normalizePhone(value) : value,
    ),
    Matches(/^01[3-9]\d{8}$/, {
      message: 'phone must be a valid BD mobile number',
    }),
  );
