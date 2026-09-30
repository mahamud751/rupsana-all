import { Module } from '@nestjs/common';
import {
  AddressesController,
  NotificationsController,
  WishlistController,
} from './account.controller.js';
import { AccountService } from './account.service.js';

@Module({
  controllers: [
    AddressesController,
    WishlistController,
    NotificationsController,
  ],
  providers: [AccountService],
})
export class AccountModule {}
