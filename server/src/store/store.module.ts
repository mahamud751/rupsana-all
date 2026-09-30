import { Global, Module } from '@nestjs/common';
import { AdminStoreController, StoreController } from './store.controller.js';
import { StoreService } from './store.service.js';

@Global()
@Module({
  controllers: [StoreController, AdminStoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
