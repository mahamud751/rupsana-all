import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFaqDto, UpdateFaqDto, UpdateSettingsDto } from './store.dto.js';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async settings() {
    const { id: _id, ...settings } =
      await this.prisma.storeSettings.findUniqueOrThrow({ where: { id: 1 } });
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    await this.prisma.storeSettings.update({ where: { id: 1 }, data: dto });
    return this.settings();
  }

  faqs() {
    return this.prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  createFaq(dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: dto });
  }

  updateFaq(id: string, dto: UpdateFaqDto) {
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  deleteFaq(id: string) {
    return this.prisma.faq.delete({ where: { id } });
  }
}
