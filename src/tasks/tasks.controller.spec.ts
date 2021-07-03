import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { mockDeep, mockReset } from 'jest-mock-extended'

const taskServiceMock = mockDeep<TasksService>()

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    mockReset(taskServiceMock)

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: taskServiceMock }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should found for valid task id', async () => {
    taskServiceMock.findOne.mockResolvedValue({ id: 1, name: 'foo' })
    await expect(controller.findOne('1')).resolves.toBeDefined()
  });
  it('should not found for invalid task id', async () => {
    taskServiceMock.findOne.mockResolvedValue(null)
    await expect(controller.findOne('99')).rejects.toBeDefined()
  });
});
