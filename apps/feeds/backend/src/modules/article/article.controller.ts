import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'

import { Pagination } from '@plusone/feeds/shared/types'

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

  @ApiOperation({ operationId: 'search-article' })
  @ApiQuery({
    name: 'cursor',
    description: 'Cursor of the last article for pagination.',
    type: Number,
    required: false,
  })
  @ApiQuery({ name: 's', description: 'The string that the article should match.' })
  @ApiOkResponse({ description: 'A list of articles matching the provided search string.', type: PaginatedArticlesDto })
  @Get('/search')
  search(
    @Query('cursor') cursor: Pagination['cursor'],
    @Query('s') s: string,
    @Req() { user },
  ): Promise<PaginatedArticlesDto> {
    return this.articleService.search(user.id, s, { cursor })
  }
}
