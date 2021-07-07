import { Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { PrismaService } from '../shared/service/prisma.service'
import { TaskCreatedSubscriber } from './task-created.subscriber'
import { TaskUpdatedSubscriber } from './task-updated.subscriber'

@Module({
  controllers: [TaskController, TaskCreatedSubscriber, TaskUpdatedSubscriber],
  providers: [TaskService, PrismaService],
})
export class TasksModule { }
