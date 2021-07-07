import { Injectable } from '@nestjs/common'
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus'
import { KubemqService } from './../kubemq/kubemq.service'

@Injectable()
export class KubemqHealthIndicator extends HealthIndicator {
  constructor(private kubemqServce: KubemqService) {
    super()
  }

  async healthCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.kubemqServce.pingCheck()
      const result = this.getStatus(key, true)
      return result
    } catch (err) {
      const message = 'kubemq service unavailable'
      const result = this.getStatus(key, false, { message })
      throw new HealthCheckError(message, result)
    }
  }
}
