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
  AdminAppointmentQueryDto,
  AvailabilityQueryDto,
  CreateAppointmentDto,
  CreateServiceDto,
  UpdateAppointmentStatusDto,
  UpdateServiceDto,
} from './salon.dto.js';
import {
  AppointmentEntity,
  AvailabilityEntity,
  PaginatedAppointmentsEntity,
  ServiceEntity,
} from './salon.entity.js';
import { SalonService } from './salon.service.js';

@ApiTags('Salon')
@Controller()
export class SalonController {
  constructor(private readonly salon: SalonService) {}

  @Get('services')
  @ApiOperation({ summary: 'Bridal services that can be booked' })
  services(): Promise<ServiceEntity[]> {
    return this.salon.services();
  }

  @Get('appointments/availability')
  @ApiOperation({ summary: 'Which time slots are free on a given day' })
  availability(
    @Query() query: AvailabilityQueryDto,
  ): Promise<AvailabilityEntity> {
    return this.salon.availability(query.date);
  }

  @Post('appointments')
  @Auth()
  @ApiOperation({ summary: 'Book an appointment' })
  book(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    return this.salon.book(user.id, dto);
  }

  @Get('appointments')
  @Auth()
  @ApiOperation({ summary: 'My appointments' })
  mine(@CurrentUser() user: AuthUser): Promise<AppointmentEntity[]> {
    return this.salon.mine(user.id);
  }

  @Post('appointments/:id/cancel')
  @HttpCode(200)
  @Auth()
  @ApiOperation({ summary: 'Cancel my appointment' })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AppointmentEntity> {
    return this.salon.cancelMine(user.id, id);
  }
}

@ApiTags('Admin · Salon')
@AdminOnly()
@Controller('admin')
export class AdminSalonController {
  constructor(private readonly salon: SalonService) {}

  @Get('services')
  @ApiOperation({ summary: 'All services, including hidden ones' })
  services(): Promise<ServiceEntity[]> {
    return this.salon.services(true);
  }

  @Post('services')
  @ApiOperation({ summary: 'Create a service' })
  createService(@Body() dto: CreateServiceDto): Promise<ServiceEntity> {
    return this.salon.createService(dto);
  }

  @Patch('services/:id')
  @ApiOperation({ summary: 'Update a service' })
  updateService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    return this.salon.updateService(id, dto);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'All appointments, filter by day or status' })
  list(
    @Query() query: AdminAppointmentQueryDto,
  ): Promise<PaginatedAppointmentsEntity> {
    return this.salon.adminList(query);
  }

  @Patch('appointments/:id/status')
  @ApiOperation({ summary: 'Confirm, complete or cancel an appointment' })
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentEntity> {
    return this.salon.setStatus(id, dto.status);
  }
}
