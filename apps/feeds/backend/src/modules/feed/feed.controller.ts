import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'

import { ArticleService } from '../article/article.service'
import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'

import { DiscoverResponseDto, FeedDiscoverDto, FeedInputDto, FeedResponseDto } from './feed.dto'
import { FeedService } from './feed.service'

@UseGuards(JwtAccessTokenGuard)
@ApiBearerAuth()
@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService, private readonly articleService: ArticleService) {}

  @ApiOperation({ operationId: 'discover-feed' })
  @ApiQuery({ name: 'url', description: 'URL of the website where a feed should be discovered.', type: String })
  @ApiOkResponse({ description: 'Metadata for feed that has been discovered.', type: DiscoverResponseDto })
  @Post('discover')
  discover(@Query() feedDiscoverDto: FeedDiscoverDto): Promise<DiscoverResponseDto> {
    return this.feedService.discover(feedDiscoverDto)
  }

  @ApiOperation({ operationId: 'add-feed' })
  @ApiBody({ description: 'Required information to create a feed.', type: FeedInputDto })
  @ApiCreatedResponse({ description: 'Metadata of the feed that has been created.', type: FeedResponseDto })
  @Post()
  add(@Body() feedInputDto: FeedInputDto, @Req() { user }): Promise<FeedResponseDto> {
    return this.feedService.create(feedInputDto, user.id)
  }

  @ApiOperation({ operationId: 'get-feeds' })
  @ApiOkResponse({ description: 'Metadata of all feeds.', type: [FeedResponseDto] })
  @Get()
  getAll(@Req() { user }): Promise<FeedResponseDto[]> {
    return this.feedService.findAllFor(user)
  }
}
