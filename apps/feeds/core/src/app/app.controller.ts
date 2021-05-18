import { Body, Controller, Get, Post } from '@nestjs/common'

import { FeedService } from '@plusone/feeds/feed'

import { AddWebsiteDto } from '../dto/add-website.dto'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly feedService: FeedService) {}

  @Post()
  addWebsite(@Body() addWebsiteDto: AddWebsiteDto) {
    return this.appService.addWebsite(addWebsiteDto)
  }

  @Get()
  getAll() {
    return this.feedService.findAll()
  }
}
