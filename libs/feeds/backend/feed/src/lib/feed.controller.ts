import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@plusone/feeds/backend/authentication'
import { ArticleService } from '@plusone/feeds/backend/article'
import { Feed } from '@plusone/feeds/backend/persistence'

import { FeedService } from './feed.service'
import { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly articleService: ArticleService) {}

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
    return this.feedService.findAllFor(user)
  }

  @Get(':feedId')
  get(@Param('feedId') feedId: Feed['id'], @Req() { user }, @Query('includeRead') includeRead: string) {
    return this.articleService.getForUserAndFeed(user.username, feedId, includeRead === 'true')
  }
}
