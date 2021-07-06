import { Injectable } from '@nestjs/common'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { tasks as Task } from '@prisma/client'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class TasksService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createTaskDto: CreateTaskDto): Promise<Task | null> {
    return this.prismaService.tasks.create({
      data: {
        name: createTaskDto.name,
      },
    })
  }

  async findAll(
    searchString?: string,
    limit?: number,
    offset?: number,
  ): Promise<[Task[], number]> {
    const [tasks, totalTask] = await this.prismaService.$transaction([
      this.prismaService.tasks.findMany({
        where: { name: { contains: searchString } },
        take: Number(limit) || 10,
        skip: Number(offset) || 0,
        orderBy: { id: 'desc' },
      }),
      this.prismaService.tasks.count(),
    ])
    return [tasks, totalTask]
  }

  findOne(id: number): Promise<Task | null> {
    return this.prismaService.tasks.findUnique({ where: { id } })
  }

  update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    return this.prismaService.tasks.update({
      data: {
        name: updateTaskDto.name,
      },
      where: { id },
    })
  }

  remove(id: number): Promise<Task | null> {
    return this.prismaService.tasks.delete({ where: { id } })
  }
}
