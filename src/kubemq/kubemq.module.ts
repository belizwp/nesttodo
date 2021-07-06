import { DynamicModule, Global, Module } from '@nestjs/common';
import { KubemqService } from './kubemq.service';

@Global()
@Module({})
export class KubemqModule {
  static forRoot(): DynamicModule {
    const provider = {
      provide: KubemqService,
      useValue: new KubemqService()
    }
    return {
      module: KubemqModule,
      providers: [provider],
      exports: [provider],
    };
  }
}
