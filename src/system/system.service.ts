import { Injectable } from '@nestjs/common'

@Injectable()
export class SystemService {
  getVersion() {
    return {
      env: 'local',
      version: '1.0',
    }
  }
}
