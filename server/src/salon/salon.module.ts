import { Module } from '@nestjs/common';
import { AdminSalonController, SalonController } from './salon.controller.js';
import { SalonService } from './salon.service.js';

@Module({
  controllers: [SalonController, AdminSalonController],
  providers: [SalonService],
})
export class SalonModule {}
