import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  public getHealth() {
    return { status: 'ok' }
  }
}
