import { Body, Controller, Logger, OnModuleInit } from '@nestjs/common'
import { SubscribeTo } from 'src/kubemq/kubemq.decorator'
import { KubemqService } from 'src/kubemq/kubemq.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { TasksService } from './tasks.service'
import { validateOrReject } from 'class-validator'

@Controller()
export class TasksSubscriber implements OnModuleInit {
  private logger = new Logger(TasksSubscriber.name)
  constructor(
    private readonly kubemqService: KubemqService,
    private readonly tasksService: TasksService,
  ) {}

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
