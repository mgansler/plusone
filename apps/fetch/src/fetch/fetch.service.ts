import { Injectable, Logger } from '@nestjs/common'
import * as Parser from 'rss-parser'

@Injectable()
export class FetchService {
  private parser = new Parser()
  private logger = new Logger(FetchService.name)

  async fetch(uri: string) {
    const feed = await this.parser.parseURL(uri)
    this.logger.log(`${uri}: ${feed.items.length}`)
  }
}
