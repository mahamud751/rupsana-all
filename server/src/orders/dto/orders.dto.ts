import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  DeliveryArea,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../generated/prisma/enums.js';
import { AddressDto } from '../../account/dto/account.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination.dto.js';

export class CartItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;
}

export class QuoteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsEnum(DeliveryArea)
  area: DeliveryArea;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  promoCode?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  /** Where to deliver (area decides the delivery fee) */
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  /** Also save this address to my account */
  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  /** Required for BKASH: Transaction ID from the bKash SMS */
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.BKASH)
  @Matches(/^[A-Za-z0-9]{8,12}$/, {
    message: 'bkashTrxId must be the 8–12 character bKash Transaction ID',
  })
  bkashTrxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  promoCode?: string;
}

export class AdminOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  /** Search by order number (e.g. 12 or RS-000012), phone or name */
  @IsOptional()
  @IsString()
  q?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  /** Optional note shown in the order timeline */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}

export class CreatePromoDto {
  /** Upper-case code, e.g. BRIDE10 */
  @Matches(/^[A-Z0-9]{3,20}$/, {
    message: 'code must be 3–20 upper-case letters/numbers',
  })
  code: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsOptional() @IsInt() @Min(1) @Max(90) percentOff?: number;
  @IsOptional() @IsInt() @Min(1) amountOff?: number;
  @IsOptional() @IsBoolean() freeDelivery?: boolean;
  /** Minimum subtotal (BDT) to use the code */
  @IsOptional() @IsInt() @Min(0) minSubtotal?: number;
  /** Total number of uses allowed; empty = unlimited */
  @IsOptional() @IsInt() @Min(1) usageLimit?: number;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdatePromoDto extends PartialType(CreatePromoDto) {}
