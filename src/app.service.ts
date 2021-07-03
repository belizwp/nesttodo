import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getVersion() {
    return {
      env: 'local',
      version: '1.0',
    }
  }
}
