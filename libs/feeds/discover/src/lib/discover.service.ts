import { HttpService, Injectable, Logger } from '@nestjs/common'
import * as cheerio from 'cheerio'
import * as Parser from 'rss-parser'
import { Output } from 'rss-parser'

import { DiscoverFeedRequest } from './discover.types'

@Injectable()
export class DiscoverService {
  private parser = new Parser()
  private logger = new Logger(DiscoverService.name)

  constructor(private readonly httpService: HttpService) {}

  async discoverFeedForWebsite(requestedUri: DiscoverFeedRequest): Promise<Output<unknown> | null> {
    this.logger.log('Starting feed discovery for: ' + requestedUri)

    try {
      const website = await this.httpService.get(requestedUri, { timeout: 5_000 }).toPromise()
      const $ = cheerio.load(website.data)

      const linkElements = $("link[type*='rss']", 'head').get()
      for (const el of linkElements) {
        const href = el.attribs['href']
        const feed = await this.parser.parseURL(href)
        if (feed) {
          this.logger.log(`Feed discovered: ${feed.title} - ${href}`)
          return { ...feed, feedUrl: feed.feedUrl ?? href }
        }
      }
    } catch (e) {
      this.logger.warn(`No feed discovered for ${requestedUri}`)
      this.logger.error(e)
      return null
    }
  }
}
