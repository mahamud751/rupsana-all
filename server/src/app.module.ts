import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { StoreModule } from './store/store.module.js';
import { AccountModule } from './account/account.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { SalonModule } from './salon/salon.module.js';
import { UploadsController } from './uploads/uploads.controller.js';
import { UPLOADS_DIR } from './uploads/uploads.constants.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_DIR,
      serveRoot: '/uploads',
      serveStaticOptions: { maxAge: '7d', index: false },
    }),
    PrismaModule,
    StoreModule,
    AuthModule,
    CatalogModule,
    AccountModule,
    OrdersModule,
    SalonModule,
  ],
  controllers: [UploadsController, HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
