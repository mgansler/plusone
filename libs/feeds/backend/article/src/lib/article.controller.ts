import { Body, Controller, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@plusone/feeds/backend/authentication'
import type { ArticleResponse } from '@plusone/feeds/shared/types'

import type { ArticleService } from './article.service'
import type { ArticleToggleUnreadDto } from './article.dto'

@Controller('article')
@UseGuards(JwtAuthGuard)
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
}
