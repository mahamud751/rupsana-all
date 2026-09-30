import { PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsString() storeName?: string;
  @IsOptional() @IsString() phone?: string;
  /** WhatsApp number in international form without "+", e.g. 8801712345678 */
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEmail() email?: string;
  /** bKash number customers send money to */
  @IsOptional() @IsString() bkashNumber?: string;
  @IsOptional() @IsString() salonAddress?: string;
  @IsOptional() @IsString() salonHours?: string;
  /** Delivery fee inside Dhaka (BDT) */
  @IsOptional() @IsInt() @Min(0) deliveryInside?: number;
  /** Delivery fee outside Dhaka (BDT) */
  @IsOptional() @IsInt() @Min(0) deliveryOutside?: number;
  /** Appointment time slots, e.g. ["10:00 AM", "11:30 AM"] */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @Matches(/^\d{1,2}:\d{2} (AM|PM)$/, { each: true })
  timeSlots?: string[];
  /** How many appointments can share one time slot */
  @IsOptional() @IsInt() @Min(1) slotCapacity?: number;
}

export class CreateFaqDto {
  @IsString() @MinLength(3) question: string;
  @IsString() @MinLength(3) answer: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}
