import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    let result = this.tasksService.findOne(+id);
    if (result) {
      return result
    }
    throw new HttpException(`not found task ${id}`, HttpStatus.NOT_FOUND);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    let result = this.tasksService.update(+id, updateTaskDto);
    if (result) {
      return result
    }
    throw new HttpException(`cannot update task ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    let result = this.tasksService.remove(+id);
    if (result) {
      return result
    }
    throw new HttpException(`cannot delete task ${id}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
