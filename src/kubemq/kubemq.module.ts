import { DynamicModule, Global, Inject, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { KubemqService } from './kubemq.service'

@Global()
@Module({
  providers: [KubemqService, ConfigService],
  exports: [KubemqService],
})
export class KubemqModule { }
