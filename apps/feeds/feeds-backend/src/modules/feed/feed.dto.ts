import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUrl, ValidateIf } from 'class-validator'

import { Sort } from '../../app/shared'
import { TagResponseDto } from '../tag/tag.dto'

export class DiscoverResponseDto {
  @ApiProperty({ type: String, nullable: true })
  feedUrl: string | null

  @ApiProperty({ type: String, nullable: true })
  title: string | null

  @ApiProperty()
  url: string
}

export class FeedDiscoverDto {
  @ApiProperty()
  @IsUrl({ require_tld: false })
  url: string
}

export class FeedInputDto {
  @ApiProperty({ required: false })
  @ValidateIf((o) => typeof o.url !== 'undefined')
  @IsUrl({ require_tld: false })
  url?: string

  @ApiProperty()
  title?: string

  @ApiProperty()
  @IsUrl({ require_tld: false })
  feedUrl: string
}

export class FeedSettingsResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  expandContent: boolean

  @ApiProperty()
  includeRead: boolean

  @ApiProperty({ enum: Sort, enumName: 'Sort' })
  order: Sort
}

export class UpdateFeedSettingsInputDto {
  @ApiProperty()
  expandContent: boolean

  @ApiProperty()
  includeRead: boolean

  @ApiProperty({ enum: Sort, enumName: 'Sort' })
  order: Sort

  @ApiProperty({ required: false })
  title?: string
}

export class FeedResponseDto {
  @ApiProperty()
  feedUrl: string

  @ApiProperty()
  id: string

  @ApiProperty()
  originalTitle: string

  @ApiPropertyOptional()
  title?: string
}

export class UserFeedResponseDto {
  @ApiProperty()
  feedUrl: string

  @ApiProperty()
  id: string

  @ApiProperty()
  feedId: string

  @ApiProperty()
  originalTitle: string

  @ApiPropertyOptional()
  title?: string

  @ApiProperty()
  includeRead: boolean

  @ApiProperty({ enum: Sort, enumName: 'Sort' })
  order: Sort

  @ApiProperty()
  expandContent: boolean

  @ApiProperty()
  unreadCount: number

  @ApiProperty({ type: [TagResponseDto] })
  tags: Array<TagResponseDto>
}

export class TagFeedInputDto {
  @ApiProperty()
  tagId: string
}
