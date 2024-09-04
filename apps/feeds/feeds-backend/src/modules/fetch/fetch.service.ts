import { Injectable, Logger } from '@nestjs/common'
import Parser, { Item } from 'rss-parser'

@Injectable()
export class FetchService {
  private parser = new Parser({ timeout: 30_000 })
  private logger = new Logger(FetchService.name)

  async fetchFeedItems(uri: string): Promise<Array<Item>> {
    try {
      const feed = await this.parser.parseURL(uri)
      return feed.items
    } catch (e) {
      this.logger.error(`${e} (${uri})`)
      return []
    }
  }
}
