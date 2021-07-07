import { Controller, Get } from '@nestjs/common'
import { SystemService } from './system.service'
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus'
import { DatabaseHealthIndicator } from './databse.health'
import { KubemqHealthIndicator } from './kubemq.health'

@Controller()
export class SystemController {
  constructor(
    private appService: SystemService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: DatabaseHealthIndicator,
    private kubemq: KubemqHealthIndicator,
  ) {}

  @Get('/system/version')
  getHello() {
    return this.appService.getVersion()
  }

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.healthCheck('database'),
      () => this.kubemq.healthCheck('kubemq'),
    ])
  }
}
