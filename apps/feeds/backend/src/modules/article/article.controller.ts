import { Body, Controller, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common'

import { ArticleResponse } from '@plusone/feeds/shared/types'

import { JwtAuthGuard } from '../authentication/jwt-auth.guard'

import { ArticleToggleUnreadDto } from './article.dto'
import { ArticleService } from './article.service'

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
