import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { AppointmentStatus } from '../generated/prisma/enums.js';
import { IsBdPhone } from '../common/decorators/is-bd-phone.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination.dto.js';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class AvailabilityQueryDto {
  /** Day to check, YYYY-MM-DD */
  @Matches(DATE_ONLY, { message: 'date must be YYYY-MM-DD' })
  date: string;
}

export class CreateAppointmentDto {
  @IsUUID()
  serviceId: string;

  /** YYYY-MM-DD (from tomorrow up to 60 days ahead) */
  @Matches(DATE_ONLY, { message: 'date must be YYYY-MM-DD' })
  date: string;

  /** One of the slots from GET /appointments/availability, e.g. "10:00 AM" */
  @IsString()
  slot: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsBdPhone()
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class AdminAppointmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  /** Only this day, YYYY-MM-DD */
  @IsOptional()
  @Matches(DATE_ONLY, { message: 'date must be YYYY-MM-DD' })
  date?: string;
}

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}

export class CreateServiceDto {
  @IsString() @MinLength(2) name: string;
  /** e.g. "3 hrs" */
  @IsString() durationLabel: string;
  /** BDT, 0 for free */
  @IsInt() @Min(0) price: number;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
