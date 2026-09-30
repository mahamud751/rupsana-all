import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DeliveryArea } from '../../generated/prisma/enums.js';
import { IsBdPhone } from '../../common/decorators/is-bd-phone.decorator.js';

export class AddressDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName: string;

  @IsBdPhone()
  phone: string;

  @IsEnum(DeliveryArea)
  area: DeliveryArea;

  /** City or district */
  @IsString()
  @MinLength(2)
  city: string;

  /** House, road, area, landmark */
  @IsString()
  @MinLength(6)
  @MaxLength(300)
  line: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class CreateAddressDto extends AddressDto {
  /** Make this the default address */
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
