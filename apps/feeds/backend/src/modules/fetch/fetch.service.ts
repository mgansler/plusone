import { Injectable, Logger } from '@nestjs/common'
import * as Parser from 'rss-parser'
import { Item } from 'rss-parser'

import { UpdateFeedRequest } from '@plusone/feeds/shared/types'

@Injectable()
export class FetchService {
  private parser = new Parser({ timeout: 30_000 })
  private logger = new Logger(FetchService.name)

  async fetchFeedItems(uri: UpdateFeedRequest): Promise<Item[]> {
    try {
      const feed = await this.parser.parseURL(uri)
      return feed.items
    } catch (e) {
      this.logger.error(`${e} (${uri})`)
      return []
    }
  }
}
