import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import * as cheerio from 'cheerio'
import Parser from 'rss-parser'
import { catchError, firstValueFrom } from 'rxjs'

import { discoveredFeedSchema, DiscoverFeed } from './discover.schema'

@Injectable()
export class DiscoverService {
  private parser = new Parser()
  private logger = new Logger(DiscoverService.name)

  constructor(private readonly httpService: HttpService) {}

  async discoverFeedForWebsite(requestedUri: string): Promise<DiscoverFeed | null> {
    this.logger.log(`Starting feed discovery for: ${requestedUri}.`)

    try {
      const website = await firstValueFrom(
        this.httpService.get(requestedUri, { timeout: 5_000 }).pipe(
          catchError((error: AxiosError) => {
            this.logger.debug(error.response?.data)
            throw `Could not connect to ${requestedUri}.`
          }),
        ),
      )
      const $ = cheerio.load(website.data)

      const linkElements = $("link[type*='rss']").get()
      for (const el of linkElements) {
        const href = el.attribs['href']
        let feedUrl = href
        if (!href.startsWith('http')) {
          feedUrl = requestedUri + href
        }
        const discoveredFeed = discoveredFeedSchema.parse(await this.parser.parseURL(feedUrl))
        if (discoveredFeed) {
          this.logger.log(`Feed discovered: ${discoveredFeed.title} - ${feedUrl}.`)
          return { ...discoveredFeed, feedUrl: discoveredFeed.feedUrl ?? feedUrl }
        } else {
          this.logger.warn(`No feed discovered for ${requestedUri}.`)
        }
      }
    } catch (e) {
      this.logger.warn(e)
    }

    // We either returned a discovered feed already
    return null
  }
}
