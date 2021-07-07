import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SystemService {
  constructor(private configService: ConfigService) { }
  getVersion() {
    return {
      env: this.configService.get('env'),
      name: this.configService.get('name'),
      version: this.configService.get('version'),
    }
  }
}
