import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './task/task.module'
import { KubemqModule } from './kubemq/kubemq.module'
import { SystemModule } from './system/system.module'
import config from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      cache: true,
    }),
    KubemqModule,
    SystemModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
