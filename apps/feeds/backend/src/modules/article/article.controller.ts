import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'

import { Feed } from '@plusone/feeds-persistence'
import { Pagination, Sort } from '@plusone/feeds/shared/types'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'

import { ArticleResponseDto, ArticleToggleUnreadDto, PaginatedArticlesDto } from './article.dto'
import { ArticleService } from './article.service'

@UseGuards(JwtAccessTokenGuard)
@ApiBearerAuth()
@ApiTags('article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ operationId: 'toggle-unread' })
  @ApiParam({ name: 'id', description: 'The id of the article.', type: String })
  @ApiOkResponse({ description: 'The read status of article has been toggled.', type: ArticleResponseDto })
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleUnread(
    @Param('id') id: string,
    @Body() toggleUnreadDto: ArticleToggleUnreadDto,
    @Req() { user },
  ): Promise<ArticleResponseDto> {
    return this.articleService.toggleUnreadForUser(id, user.id, toggleUnreadDto.unread)
  }

  @ApiOperation({ operationId: 'find-articles' })
  @ApiQuery({
    name: 'cursor',
    description: 'Cursor of the last article for pagination.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'f',
    description: 'The id of the feed this query should be limited to.',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 's',
    description: 'The string that the article should match.',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    description: 'Should articles appear in chronically ascending or descending order.',
    enum: Sort,
    enumName: 'Sort',
    required: false,
  })
  @ApiQuery({
    name: 'r',
    description: 'Should read articles be included.',
    type: Boolean,
    required: false,
  })
  @ApiOkResponse({ description: 'A list of articles matching the provided search string.', type: PaginatedArticlesDto })
  @Get('find')
  find(
    @Query('cursor') cursor: Pagination['cursor'],
    @Query('s') searchTerm: string,
    @Query('f') feedId: Feed['id'],
    @Query('sort') sort: Sort = Sort.NewestFirst,
    @Query('r') includeRead = true,
    @Req() { user },
  ): Promise<PaginatedArticlesDto> {
    return this.articleService.find(user.id, {
      cursor,
      searchTerm,
      feedId,
      sort,
      // includeUnread is parsed as string, we need to manually convert
      includeRead: (includeRead as unknown as string) === 'true',
    })
  }
}
