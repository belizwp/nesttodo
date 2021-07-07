import { Module } from '@nestjs/common'
import { TasksModule } from './task/task.module'
import { KubemqModule } from './kubemq/kubemq.module'
import { SystemModule } from './system/system.module'

@Module({
  imports: [KubemqModule.forRoot(), SystemModule, TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
