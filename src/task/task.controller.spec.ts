import { Test, TestingModule } from '@nestjs/testing'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'
import { mockDeep, mockReset } from 'jest-mock-extended'

const taskServiceMock = mockDeep<TaskService>()

describe('TaskController', () => {
  let controller: TaskController

  beforeEach(async () => {
    mockReset(taskServiceMock)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: taskServiceMock }],
    }).compile()

    controller = module.get<TaskController>(TaskController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  it('should found for valid task id', async () => {
    taskServiceMock.findOne.mockResolvedValue({ id: 1, name: 'foo' })
    await expect(controller.findOne('1')).resolves.toBeDefined()
  })
  it('should not found for invalid task id', async () => {
    taskServiceMock.findOne.mockResolvedValue(null)
    await expect(controller.findOne('99')).rejects.toBeDefined()
  })
})
