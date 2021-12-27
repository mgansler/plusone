import { Injectable, Logger } from '@nestjs/common'
import * as Parser from 'rss-parser'

import { UpdateFeedRequest } from '@plusone/feeds/shared/types'

@Injectable()
export class FetchService {
  private parser = new Parser()
  private logger = new Logger(FetchService.name)

  async fetchFeedArticles(uri: UpdateFeedRequest) {
    try {
      const feed = await this.parser.parseURL(uri)
      this.logger.log(`Fetched ${feed.items.length} articles for ${feed.title}`)
      return feed.items
    } catch (e) {
      this.logger.error(e)
      return []
    }
  }
}
