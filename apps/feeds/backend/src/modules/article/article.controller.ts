import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger'

import { Pagination } from '@plusone/feeds/shared/types'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'

import { ArticleResponseDto, ArticleToggleUnreadDto, PaginatedArticlesDto } from './article.dto'
import { ArticleService } from './article.service'

@Controller('article')
@UseGuards(JwtAccessTokenGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'The id of the article.', type: String })
  @ApiOkResponse({ description: 'The read status of article has been toggled.', type: ArticleResponseDto })
  async toggleUnread(
    @Param('id') id: string,
    @Body() toggleUnreadDto: ArticleToggleUnreadDto,
    @Req() { user },
  ): Promise<ArticleResponseDto> {
    return this.articleService.toggleUnreadForUser(id, user.id, toggleUnreadDto.unread)
  }

  @Get('/search')
  @ApiQuery({ name: 'cursor', description: 'Cursor of the last article for pagination.' })
  @ApiQuery({ name: 's', description: 'The string that the article should match.' })
  @ApiOkResponse({ description: 'A list of articles matching the provided search string.', type: PaginatedArticlesDto })
  search(
    @Query('cursor') cursor: Pagination['cursor'],
    @Query('s') s: string,
    @Req() { user },
  ): Promise<PaginatedArticlesDto> {
    return this.articleService.search(user.id, s, { cursor })
  }
}
