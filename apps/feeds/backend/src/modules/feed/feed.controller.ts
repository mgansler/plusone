import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger'

import { Feed } from '@plusone/feeds-persistence'
import { Pagination } from '@plusone/feeds/shared/types'

import { PaginatedArticlesDto } from '../article/article.dto'
import { ArticleService } from '../article/article.service'
import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'

import { DiscoverResponseDto, FeedDiscoverDto, FeedInputDto, FeedResponseDto } from './feed.dto'
import { FeedService } from './feed.service'

@Controller('feed')
@UseGuards(JwtAccessTokenGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly articleService: ArticleService) {}

  @Get('discover')
  @ApiQuery({ name: 'url', description: 'URL of the website where a feed should be discovered.' })
  @ApiOkResponse({ description: 'Metadata for feed that has been discovered.', type: DiscoverResponseDto })
  discover(@Query() feedDiscoverDto: FeedDiscoverDto): Promise<DiscoverResponseDto> {
    return this.feedService.discover(feedDiscoverDto)
  }

  @Post()
  @ApiBody({ description: 'Required information to create a feed.' })
  @ApiCreatedResponse({ description: 'Metadata of the feed that has been created.', type: FeedResponseDto })
  add(@Body() feedInputDto: FeedInputDto, @Req() { user }): Promise<FeedResponseDto> {
    return this.feedService.create(feedInputDto, user.id)
  }

  @Get()
  @ApiOkResponse({ description: 'Metadata of all feeds.', type: [FeedResponseDto] })
  getAll(@Req() { user }): Promise<FeedResponseDto[]> {
    return this.feedService.findAllFor(user)
  }

  @Get(':feedId')
  @ApiParam({ name: 'feedId', description: 'The id of the feed.' })
  @ApiQuery({ name: 'cursor', description: 'Cursor of the last article for pagination.' })
  @ApiOkResponse({ description: 'Paginated list of articles for given feed.', type: PaginatedArticlesDto })
  get(
    @Param('feedId') feedId: Feed['id'],
    @Query('cursor') cursor: Pagination['cursor'],
    @Req() { user },
  ): Promise<PaginatedArticlesDto> {
    return this.articleService.getForUserAndFeed(user.id, feedId, { cursor })
  }
}
