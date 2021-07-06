import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TasksModule } from './tasks/tasks.module'
import { HealthModule } from './health/health.module'
import { KubemqModule } from './kubemq/kubemq.module'

@Module({
  imports: [KubemqModule.forRoot(), HealthModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
