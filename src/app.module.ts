import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TasksModule } from './tasks/tasks.module'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './health/health.controller'
import { DatabaseHealthIndicator } from './databse.health'
import { PrismaService } from './prisma.service'

@Module({
  imports: [TerminusModule, TasksModule],
  controllers: [AppController, HealthController],
  providers: [AppService, PrismaService, DatabaseHealthIndicator],
})
export class AppModule { }
