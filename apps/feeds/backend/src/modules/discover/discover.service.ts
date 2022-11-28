import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import * as cheerio from 'cheerio'
import * as Parser from 'rss-parser'
import { catchError, firstValueFrom } from 'rxjs'

import { DiscoverFeedRequest } from '@plusone/feeds/shared/types'

@Injectable()
export class DiscoverService {
  private parser = new Parser()
  private logger = new Logger(DiscoverService.name)

  constructor(private readonly httpService: HttpService) {}

  async discoverFeedForWebsite(requestedUri: DiscoverFeedRequest): Promise<Parser.Output<unknown> | null> {
    this.logger.log('Starting feed discovery for: ' + requestedUri)

    try {
      const website = await firstValueFrom(
        this.httpService.get(requestedUri, { timeout: 5_000 }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw `Could not connect to ${requestedUri}`
          }),
        ),
      )
      const $ = cheerio.load(website.data)

      const linkElements = $("link[type*='rss']").get()
      for (const el of linkElements) {
        const href = el.attribs['href']
        let url = href
        if (!href.startsWith('http')) {
          url = requestedUri + href
        }
        const feed = await this.parser.parseURL(url)
        if (feed) {
          this.logger.log(`Feed discovered: ${feed.title} - ${url}`)
          return { ...feed, feedUrl: feed.feedUrl ?? url }
        } else {
          this.logger.warn(`No feed discovered for ${requestedUri}`)
        }
      }
    } catch (e) {
      this.logger.error(e)
      return null
    }
  }
}
