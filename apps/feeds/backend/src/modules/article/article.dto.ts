import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

import { Article, ArticleResponse, PaginatedArticles, ToggleUnreadRequest } from '@plusone/feeds/shared/types'

class ArticleDto implements Article {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  content: string

  @ApiProperty()
  contentBody: string

  @ApiProperty()
  guid: string

  @ApiProperty()
  link: string
}

export class ArticleResponseDto implements ArticleResponse {
  @ApiProperty()
  article: ArticleDto

  @ApiProperty()
  cursor: number

  @ApiProperty()
  unread: boolean
}

export class ArticleToggleUnreadDto implements ToggleUnreadRequest {
  @ApiProperty()
  @IsBoolean()
  unread: boolean
}

export class PaginatedArticlesDto implements PaginatedArticles {
  @ApiProperty({ type: [ArticleResponseDto] })
  content: ArticleResponseDto[]

  @ApiProperty()
  pageSize: number

  @ApiProperty()
  totalCount: number

  @ApiProperty()
  unreadCount: number

  @ApiPropertyOptional()
  lastCursor?: number
}
