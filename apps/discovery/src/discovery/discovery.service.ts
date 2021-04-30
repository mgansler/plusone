import { HttpService, Injectable, Logger } from '@nestjs/common'
import * as cheerio from 'cheerio'
import * as Parser from 'rss-parser'

@Injectable()
export class DiscoveryService {
  private parser: Parser

  constructor(private readonly httpService: HttpService) {
    this.parser = new Parser()
  }

  async discoverFeedForWebsite(uri: string): Promise<string | null> {
    Logger.log('Starting feed discovery for: ' + uri)

    const website = await this.httpService.get(uri).toPromise()
    const $ = cheerio.load(website.data)

    const linkElements = $("link[type*='rss']", 'head').get()
    for (const el of linkElements) {
      const href = el.attribs['href']
      const feed = await this.parser.parseURL(href)
      if (feed) {
        return href
      }
    }

    return null
  }
}
