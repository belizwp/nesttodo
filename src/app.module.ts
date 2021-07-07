import { Module } from '@nestjs/common'
import { TasksModule } from './tasks/tasks.module'
import { KubemqModule } from './kubemq/kubemq.module'
import { SystemModule } from './system/system.module'

@Module({
  imports: [SystemModule, KubemqModule.forRoot(), TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
