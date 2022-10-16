import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'

import { Feed } from '@plusone/feeds-persistence'
import { DiscoverResponse, FeedResponse, PaginatedArticles, Pagination } from '@plusone/feeds/shared/types'

import { ArticleService } from '../article/article.service'
import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'

import { FeedDiscoverDto, FeedInputDto } from './feed.dto'
import { FeedService } from './feed.service'

@Controller('feed')
@UseGuards(JwtAccessTokenGuard)
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
