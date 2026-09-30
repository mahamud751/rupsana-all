import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly, Auth } from '../common/decorators/auth.decorator.js';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import {
  AdminOrderQueryDto,
  CreateOrderDto,
  CreatePromoDto,
  QuoteDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  UpdatePromoDto,
} from './dto/orders.dto.js';
import {
  AdminOrderEntity,
  OrderEntity,
  PaginatedOrdersEntity,
  PromoCodeEntity,
  QuoteEntity,
} from './entities/orders.entity.js';
import { OrdersService } from './orders.service.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('quote')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Price a cart: current prices, stock, delivery fee and promo code',
  })
  quote(@Body() dto: QuoteDto): Promise<QuoteEntity> {
    return this.orders.quote(dto);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Place an order (reserves stock)' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderEntity> {
    return this.orders.create(user.id, dto);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'My orders (newest first)' })
  list(@CurrentUser() user: AuthUser): Promise<OrderEntity[]> {
    return this.orders.listMine(user.id);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'One of my orders, with its status timeline' })
  get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderEntity> {
    return this.orders.getMine(user.id, id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @Auth()
  @ApiOperation({ summary: 'Cancel my order (only before it is confirmed)' })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderEntity> {
    return this.orders.cancelMine(user.id, id);
  }
}

@ApiTags('Admin · Orders')
@AdminOnly()
@Controller('admin')
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('orders')
  @ApiOperation({ summary: 'All orders, filter by status or search' })
  list(@Query() query: AdminOrderQueryDto): Promise<PaginatedOrdersEntity> {
    return this.orders.adminList(query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Order details with customer' })
  get(@Param('id', ParseUUIDPipe) id: string): Promise<AdminOrderEntity> {
    return this.orders.adminGet(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({
    summary:
      'Move an order forward (PLACED → CONFIRMED → SHIPPED → DELIVERED) or cancel it',
  })
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    return this.orders.adminUpdateStatus(id, dto);
  }

  @Patch('orders/:id/payment')
  @ApiOperation({
    summary: 'Mark payment as paid/refunded (e.g. after checking bKash)',
  })
  payment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ): Promise<AdminOrderEntity> {
    return this.orders.adminUpdatePayment(id, dto.paymentStatus);
  }

  @Get('promo-codes')
  @ApiOperation({ summary: 'List promo codes' })
  promos(): Promise<PromoCodeEntity[]> {
    return this.orders.listPromos();
  }

  @Post('promo-codes')
  @ApiOperation({ summary: 'Create a promo code' })
  createPromo(@Body() dto: CreatePromoDto): Promise<PromoCodeEntity> {
    return this.orders.createPromo(dto);
  }

  @Patch('promo-codes/:code')
  @ApiOperation({ summary: 'Update or deactivate a promo code' })
  updatePromo(
    @Param('code') code: string,
    @Body() dto: UpdatePromoDto,
  ): Promise<PromoCodeEntity> {
    return this.orders.updatePromo(code, dto);
  }
}
