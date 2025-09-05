import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

class ArticleDto {
  @ApiProperty({ type: String, nullable: true })
  content: string | null

  @ApiProperty()
  date: Date

  @ApiProperty()
  guid: string

  @ApiProperty()
  id: string

  @ApiProperty()
  feedId: string

  @ApiProperty({ type: String, nullable: true })
  link: string | null

  @ApiProperty({ type: String, nullable: true })
  title: string | null
}

export class ArticleResponseDto {
  @ApiProperty()
  article: ArticleDto

  @ApiProperty()
  cursor: number

  @ApiProperty()
  starred: boolean

  @ApiProperty()
  unread: boolean
}

export class ArticleToggleUnreadDto {
  @ApiProperty()
  @IsBoolean()
  unread: boolean
}

export class PaginatedArticleResponseDto {
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
