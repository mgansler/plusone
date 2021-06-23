import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@plusone/feeds/backend/authentication'

import { FeedService } from './feed.service'
import { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post('discover')
  @HttpCode(HttpStatus.OK)
  discover(@Body() feedDiscoverDto: FeedDiscoverDto) {
    return this.feedService.discover(feedDiscoverDto)
  }

  @Post()
  add(@Body() feedInputDto: FeedInputDto, @Req() { user }) {
    return this.feedService.create(feedInputDto, user.username)
  }

  @Get()
  getAll(@Req() { user }) {
    return this.feedService.findAll(user)
  }
}
