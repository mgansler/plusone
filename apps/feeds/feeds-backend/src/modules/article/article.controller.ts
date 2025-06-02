import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'

import { Feed } from '@plusone/feeds-persistence'

import { Pagination, Sort } from '../../app/shared'
import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'

import { ArticleResponseDto, ArticleToggleUnreadDto, PaginatedArticleResponseDto, StarArticleDto } from './article.dto'
import { ArticleService } from './article.service'

@UseGuards(JwtAccessTokenGuard)
@ApiBearerAuth()
@ApiTags('article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ operationId: 'mark-articles-read' })
  @ApiQuery({
    name: 'f',
    description: 'The id of the feed where all articles should be marked as read.',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 's',
    description: 'The string that the article should match.',
    type: String,
    required: false,
  })
  @ApiOkResponse({ description: 'All articles have been marked as read.' })
  @Post('mark-articles-read')
  markArticlesRead(@Query('f') feedId: Feed['id'], @Query('s') searchTerm: string, @Req() { user }) {
    return this.articleService.markArticlesRead({ feedId, searchTerm }, user.id)
  }

  @ApiOperation({ operationId: 'toggle-unread' })
  @ApiParam({ name: 'articleId', description: 'The id of the article.', type: String })
  @ApiOkResponse({ description: 'The read status of article has been toggled.', type: ArticleResponseDto })
  @Post(':articleId')
  @HttpCode(HttpStatus.OK)
  async toggleUnread(
    @Param('articleId') id: string,
    @Body() toggleUnreadDto: ArticleToggleUnreadDto,
    @Req() { user },
  ): Promise<ArticleResponseDto> {
    return this.articleService.toggleUnreadForUser(id, user.id, toggleUnreadDto.unread)
  }

  @ApiOperation({ operationId: 'star-article' })
  @ApiParam({ name: 'articleId', description: 'The id of the article.', type: String })
  @ApiBody({ description: '', type: StarArticleDto })
  @Put(':articleId/star')
  @HttpCode(HttpStatus.NO_CONTENT)
  starArticle(@Param('articleId') articleId: string, @Body() starArticleDto: StarArticleDto, @Req() { user }) {
    return this.articleService.starArticle(starArticleDto, articleId, user.id)
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
    name: 'starred',
    description: 'Should articles appear in chronically ascending or descending order.',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'r',
    description: 'Should read articles be included.',
    type: Boolean,
    required: false,
  })
  @ApiOkResponse({
    description: 'A list of articles matching the provided search string.',
    type: PaginatedArticleResponseDto,
  })
  @Get('find')
  find(
    @Req() { user },
    @Query('cursor') cursor: Pagination['cursor'],
    @Query('s') searchTerm: string,
    @Query('f') feedId: Feed['id'],
    @Query('r', new DefaultValuePipe(true), ParseBoolPipe) includeRead: boolean,
    @Query('starred', new ParseBoolPipe({ optional: true })) starred?: boolean,
    @Query('sort') sort: Sort = Sort.NewestFirst,
  ): Promise<PaginatedArticleResponseDto> {
    return this.articleService.find(user.id, {
      cursor,
      searchTerm,
      feedId,
      sort,
      starred,
      includeRead,
    })
  }

  @ApiOperation({ operationId: 'recently-read-articles' })
  @ApiOkResponse({ description: 'List of recently read articles', type: [ArticleResponseDto] })
  @Get('recentlyRead')
  recentlyReadArticles(@Req() { user }): Promise<Array<ArticleResponseDto>> {
    return this.articleService.findRecentlyReadArticles(user.id)
  }
}
