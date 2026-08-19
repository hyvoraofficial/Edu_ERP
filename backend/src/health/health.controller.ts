import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Assert active server and database connectivity status' })
  async check() {
    try {
      // Direct raw query execution to assert database socket state
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      throw new InternalServerErrorException({
        status: 'down',
        database: 'disconnected',
        error: err.message || 'Database connection error',
      });
    }
  }
}
