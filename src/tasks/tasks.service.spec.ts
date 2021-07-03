import { Test, TestingModule } from '@nestjs/testing'
import { TasksService } from './tasks.service'
import { PrismaService } from '../database/prisma.service'
import { prismaMock } from '../mock/prisma-singleton.mock'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  it('should create task', async () => {
    const task = { id: 1, name: 'foo' }
    // @ts-ignore
    prismaMock.tasks.create.mockResolvedValue(task)
    await expect(service.create(task)).resolves.toEqual({
      id: 1,
      name: 'foo',
    })
  })
  it('should found for task id is 2', async () => {
    const task = { id: 2, name: 'bar' }
    prismaMock.tasks.findUnique.mockResolvedValue(task)
    await expect(service.findOne(task.id)).resolves.toEqual({
      id: 2,
      name: 'bar',
    })
  })
  it('should found for task id is 3', async () => {
    const task = { id: 3, name: 'baz' }
    prismaMock.tasks.findUnique.mockResolvedValue(task)
    await expect(service.findOne(task.id)).resolves.toEqual({
      id: 3,
      name: 'baz',
    })
  })
})
