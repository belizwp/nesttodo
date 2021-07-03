import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { PrismaService } from 'src/database/prisma.service'
import { DatabaseHealthIndicator } from './databse.health'
import { HealthController } from './health.controller'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaService, DatabaseHealthIndicator],
})
export class HealthModule {}
