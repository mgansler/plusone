import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

import { Article, ArticleResponse, PaginatedArticles, ToggleUnreadRequest } from '@plusone/feeds/shared/types'

class ArticleDto implements Article {
  @ApiProperty({ type: String, nullable: true })
  content: string | null

  @ApiProperty()
  date: Date

  @ApiProperty()
  guid: string

  @ApiProperty()
  id: string

  @ApiProperty({ type: String, nullable: true })
  link: string | null

  @ApiProperty({ type: String, nullable: true })
  title: string | null
}

export class ArticleResponseDto implements ArticleResponse {
  @ApiProperty()
  article: ArticleDto

  @ApiProperty()
  cursor: number

  @ApiProperty()
  starred: boolean

  @ApiProperty()
  unread: boolean
}

export class ArticleToggleUnreadDto implements ToggleUnreadRequest {
  @ApiProperty()
  @IsBoolean()
  unread: boolean
}

export class PaginatedArticleResponseDto implements PaginatedArticles {
  @ApiProperty({ type: [ArticleResponseDto] })
  content: Array<ArticleResponseDto>

  @ApiProperty()
  pageSize: number

  @ApiProperty()
  totalCount: number

  @ApiProperty()
  unreadCount: number

  @ApiPropertyOptional()
  lastCursor?: number
}

export class StarArticleDto {
  @ApiProperty()
  starred: boolean
}
