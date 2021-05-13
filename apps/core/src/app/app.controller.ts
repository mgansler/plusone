import { Body, Controller, Get, Post } from '@nestjs/common'

import { AddWebsiteDto } from '../dto/add-website.dto'
import { FeedsService } from '../feeds/feeds.service'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly feedsService: FeedsService) {}

  @Post()
  addWebsite(@Body() addWebsiteDto: AddWebsiteDto) {
    const res = this.appService.addWebsite(addWebsiteDto)
    res.subscribe((feed) => {
      this.feedsService.create({ title: feed.title, uri: feed.feedUrl })
    })
    return res
  }

  @Get()
  getAll() {
    return this.feedsService.findAll()
  }
}
