import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { PrismaService } from 'src/database/prisma.service'
import { TasksSubscriber } from './tasks.subscriber'

@Module({
  controllers: [TasksController, TasksSubscriber],
  providers: [TasksService, PrismaService],
})
export class TasksModule { }
