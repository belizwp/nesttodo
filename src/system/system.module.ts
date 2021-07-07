import { Module } from '@nestjs/common'
import { SystemController } from './system.controller'
import { SystemService } from './system.service'
import { TerminusModule } from '@nestjs/terminus'
import { PrismaService } from 'src/database/prisma.service'
import { DatabaseHealthIndicator } from '../system/databse.health'
import { KubemqHealthIndicator } from './kubemq.health'

@Module({
  imports: [TerminusModule],
  controllers: [SystemController],
  providers: [
    SystemService,
    PrismaService,
    DatabaseHealthIndicator,
    KubemqHealthIndicator,
  ],
})
export class SystemModule {}
