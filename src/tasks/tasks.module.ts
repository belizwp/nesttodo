import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { PrismaService } from '../shared/service/prisma.service'
import { TasksCreatedSubscriber } from './tasks-created.subscriber'
import { TasksUpdatedSubscriber } from './tasks-updated.subscriber'

@Module({
  controllers: [TasksController, TasksCreatedSubscriber, TasksUpdatedSubscriber],
  providers: [TasksService, PrismaService],
})
export class TasksModule { }
