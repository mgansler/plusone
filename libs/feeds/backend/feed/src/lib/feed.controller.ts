import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@plusone/feeds/backend/authentication'
import { ArticleService } from '@plusone/feeds/backend/article'
import { Feed } from '@plusone/feeds/backend/persistence'
import { ArticleResponse, DiscoverResponse, FeedResponse, Paginated, Pagination } from '@plusone/feeds/shared/types'

import { FeedService } from './feed.service'
import { FeedDiscoverDto, FeedInputDto } from './feed.dto'

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly articleService: ArticleService) {}

  @Post('discover')
  @HttpCode(HttpStatus.OK)
  discover(@Body() feedDiscoverDto: FeedDiscoverDto): Promise<DiscoverResponse> {
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
  ): Promise<Paginated<ArticleResponse>> {
    return this.articleService.getForUserAndFeed(user.id, feedId, pagination)
  }
}
