import { Controller, Logger, OnModuleInit } from '@nestjs/common'
import { SubscribeTo } from 'src/kubemq/kubemq.decorator'
import { KubemqService } from 'src/kubemq/kubemq.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { TaskService } from './task.service'
import { validateOrReject } from 'class-validator'

@Controller()
export class TaskCreatedSubscriber implements OnModuleInit {
  private logger = new Logger(TaskCreatedSubscriber.name)
  constructor(
    private readonly kubemqService: KubemqService,
    private readonly tasksService: TaskService,
  ) { }

  onModuleInit() {
    this.kubemqService.subscribeToResponseOf('tasks.created', this)
  }

  @SubscribeTo('tasks.created')
  async process(message: string) {
    try {
      this.logger.log(`'tasks.created' subscriber received: ${message}`)
      let json = JSON.parse(message)
      let task = new CreateTaskDto()
      task.name = json['name']
      await validateOrReject(task)
      await this.tasksService.create(task)
    } catch (error) {
      this.logger.error(error)
    }
  }
}
