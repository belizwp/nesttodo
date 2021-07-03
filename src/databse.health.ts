import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from "@nestjs/terminus";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private prismaService: PrismaService) {
    super()
  }

  async healthCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`
      const result = this.getStatus(key, true)
      return result
    } catch (err) {
      const message = 'cannot reach database'
      const result = this.getStatus(key, false, { message })
      throw new HealthCheckError(message, result)
    }
  }
}
