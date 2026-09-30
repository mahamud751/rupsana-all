import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator.js';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator.js';
import { AccountService } from './account.service.js';
import { CreateAddressDto, UpdateAddressDto } from './dto/account.dto.js';
import {
  AddressEntity,
  NotificationEntity,
  UnreadCountEntity,
  WishlistEntity,
} from './entities/account.entity.js';

@ApiTags('Account · Addresses')
@Auth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly account: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'My saved addresses (default first)' })
  list(@CurrentUser() user: AuthUser): Promise<AddressEntity[]> {
    return this.account.addresses(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add an address' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressEntity> {
    return this.account.createAddress(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address or make it default' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    return this.account.updateAddress(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.account.deleteAddress(user.id, id);
  }
}

@ApiTags('Account · Wishlist')
@Auth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly account: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'My wishlist' })
  list(@CurrentUser() user: AuthUser): Promise<WishlistEntity> {
    return this.account.wishlist(user.id);
  }

  @Put(':productId')
  @ApiOperation({ summary: 'Add a product to my wishlist' })
  add(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<WishlistEntity> {
    return this.account.addToWishlist(user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from my wishlist' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<WishlistEntity> {
    return this.account.removeFromWishlist(user.id, productId);
  }
}

@ApiTags('Account · Notifications')
@Auth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly account: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'My notifications (newest first)' })
  list(@CurrentUser() user: AuthUser): Promise<NotificationEntity[]> {
    return this.account.notifications(user.id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Number of unread notifications' })
  unread(@CurrentUser() user: AuthUser): Promise<UnreadCountEntity> {
    return this.account.unreadCount(user.id);
  }

  @Post('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  readAll(@CurrentUser() user: AuthUser): Promise<UnreadCountEntity> {
    return this.account.markAllRead(user.id);
  }
}
