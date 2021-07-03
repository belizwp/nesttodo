import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { TerminusModule } from '@nestjs/terminus'
import { DatabaseHealthIndicator } from './databse.health'
import { mockDeep, mockReset } from 'jest-mock-extended'

const mockDatabaseHealthIndicator = mockDeep<DatabaseHealthIndicator>()

describe('HealthController', () => {
  let controller: HealthController

  beforeEach(async () => {
    mockReset(mockDatabaseHealthIndicator)

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        {
          provide: DatabaseHealthIndicator,
          useValue: mockDatabaseHealthIndicator,
        },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
