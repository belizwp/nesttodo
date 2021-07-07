import { Controller, Logger, OnModuleInit } from '@nestjs/common'
import { SubscribeTo } from 'src/kubemq/kubemq.decorator'
import { KubemqService } from 'src/kubemq/kubemq.service'
import { TaskService } from './task.service'
import { validateOrReject } from 'class-validator'
import { UpdateTaskDto } from './dto/update-task.dto'

@Controller()
export class TaskUpdatedSubscriber implements OnModuleInit {
  private logger = new Logger(TaskUpdatedSubscriber.name)
  constructor(
    private readonly kubemqService: KubemqService,
    private readonly tasksService: TaskService,
  ) { }

  onModuleInit() {
    this.kubemqService.subscribeToResponseOf('tasks.updated', this)
  }

  @SubscribeTo('tasks.updated')
  async process(message: string) {
    try {
      this.logger.log(`'tasks.updated' subscriber received: ${message}`)
      let json = JSON.parse(message)
      let task = new UpdateTaskDto()
      let id = json['id']
      task.name = json['name']
      await validateOrReject(task)
      await this.tasksService.update(Number(id), task)
    } catch (error) {
      this.logger.error(error)
    }
  }
}
