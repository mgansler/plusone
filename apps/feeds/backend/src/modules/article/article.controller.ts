import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common'

import { ArticleResponse, Pagination } from '@plusone/feeds/shared/types'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'

import { ArticleToggleUnreadDto } from './article.dto'
import { ArticleService } from './article.service'

@Controller('article')
@UseGuards(JwtAccessTokenGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async toggleUnread(
    @Param('id') id: string,
    @Body() toggleUnreadDto: ArticleToggleUnreadDto,
    @Req() { user },
  ): Promise<ArticleResponse> {
    return this.articleService.toggleUnreadForUser(id, user.id, toggleUnreadDto.unread)
  }

  @Get('/search')
  search(@Query('cursor') cursor: Pagination['cursor'], @Query('s') s: string, @Req() { user }) {
    return this.articleService.search(user.id, s, { cursor })
  }
}
