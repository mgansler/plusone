import { Body, Controller, Get, Post } from '@nestjs/common'

import { FeedService } from '@feeds/feed'

import { AddWebsiteDto } from '../dto/add-website.dto'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly feedService: FeedService) {}

  @Post()
  addWebsite(@Body() addWebsiteDto: AddWebsiteDto) {
    const res = this.appService.addWebsite(addWebsiteDto)
    res.subscribe((feed) => {
      this.feedService.create({ title: feed.title, uri: feed.feedUrl })
    })
    return res
  }

  @Get()
  getAll() {
    return this.feedService.findAll()
  }
}
