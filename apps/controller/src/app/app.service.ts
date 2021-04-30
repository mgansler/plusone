import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  addWebsite({ uri }): { uri: string } {
    return { uri }
  }
}
