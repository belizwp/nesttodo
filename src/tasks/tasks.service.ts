import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly tasks: Array<Task> = []

  create(createTaskDto: CreateTaskDto): Task {
    let e: Task = {
      id: this.tasks.length + 1,
      name: createTaskDto.name,
    }
    this.tasks.push(e)
    return e
  }

  findAll(): Array<Task> {
    return this.tasks
  }

  findOne(id: number): Task | undefined {
    return this.tasks.find(t => t.id === id)
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Task | undefined {
    let index = this.tasks.findIndex(t => t.id === id)
    if (index != -1) {
      let task = this.tasks[index]
      let e: Task = {
        ...task,
        name: updateTaskDto.name,
      }
      this.tasks[index] = e
      return e
    }
    return
  }

  remove(id: number): Task | undefined {
    let index = this.tasks.findIndex(t => t.id === id)
    if (index != -1) {
      let task = this.tasks[index]
      this.tasks.splice(index, 1)
      return task
    }
    return
  }
}
