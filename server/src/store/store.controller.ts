import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../common/decorators/auth.decorator.js';
import { CreateFaqDto, UpdateFaqDto, UpdateSettingsDto } from './store.dto.js';
import { FaqEntity, SettingsEntity } from './store.entity.js';
import { StoreService } from './store.service.js';

@ApiTags('Store')
@Controller()
export class StoreController {
  constructor(private readonly store: StoreService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Contact details, delivery fees and booking slots' })
  settings(): Promise<SettingsEntity> {
    return this.store.settings();
  }

  @Get('faqs')
  @ApiOperation({ summary: 'Frequently asked questions' })
  faqs(): Promise<FaqEntity[]> {
    return this.store.faqs();
  }
}

@ApiTags('Admin · Store')
@AdminOnly()
@Controller('admin')
export class AdminStoreController {
  constructor(private readonly store: StoreService) {}

  @Patch('settings')
  @ApiOperation({ summary: 'Update store settings' })
  updateSettings(@Body() dto: UpdateSettingsDto): Promise<SettingsEntity> {
    return this.store.updateSettings(dto);
  }

  @Post('faqs')
  @ApiOperation({ summary: 'Add a FAQ' })
  createFaq(@Body() dto: CreateFaqDto): Promise<FaqEntity> {
    return this.store.createFaq(dto);
  }

  @Patch('faqs/:id')
  @ApiOperation({ summary: 'Update a FAQ' })
  updateFaq(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFaqDto,
  ): Promise<FaqEntity> {
    return this.store.updateFaq(id, dto);
  }

  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Delete a FAQ' })
  deleteFaq(@Param('id', ParseUUIDPipe) id: string): Promise<FaqEntity> {
    return this.store.deleteFaq(id);
  }
}
