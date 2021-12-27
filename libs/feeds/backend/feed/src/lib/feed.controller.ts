import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@plusone/feeds/backend/authentication'
import type { ArticleService } from '@plusone/feeds/backend/article'
import type { Feed } from '@plusone/feeds/backend/persistence'
import type { DiscoverResponse, FeedResponse, PaginatedArticles, Pagination } from '@plusone/feeds/shared/types'

import type { FeedService } from './feed.service'
import type { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly articleService: ArticleService) {}

  @Get('discover')
  discover(@Query() feedDiscoverDto: FeedDiscoverDto): Promise<DiscoverResponse> {
    return this.feedService.discover(feedDiscoverDto)
  }

  @Post()
  add(@Body() feedInputDto: FeedInputDto, @Req() { user }): Promise<FeedResponse> {
    return this.feedService.create(feedInputDto, user.id)
  }

  @Get()
  getAll(@Req() { user }): Promise<FeedResponse[]> {
    return this.feedService.findAllFor(user)
  }

  @Get(':feedId')
  get(
    @Param('feedId') feedId: Feed['id'],
    @Query() pagination: Pagination,
    @Req() { user },
  ): Promise<PaginatedArticles> {
    return this.articleService.getForUserAndFeed(user.id, feedId, pagination)
  }
}
