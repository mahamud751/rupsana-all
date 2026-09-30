import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service.js';

class HealthEntity {
  status: string;
  database: string;
  time: Date;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check that the API and database are up' })
  async health(): Promise<HealthEntity> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'ok', time: new Date() };
  }
}
