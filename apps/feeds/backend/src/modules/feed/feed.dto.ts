import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUrl, ValidateIf } from 'class-validator'

import {
  DiscoverResponse,
  FeedInput,
  FeedResponse,
  Sort,
  UpdateFeedSettingsInput,
  UserFeedResponse,
} from '@plusone/feeds/shared/types'

import { TagResponseDto } from '../tag/tag.dto'

export class DiscoverResponseDto implements DiscoverResponse {
  @ApiProperty()
  feedUrl: string

  @ApiProperty()
  title: string

  @ApiProperty()
  url: string
}

export class FeedDiscoverDto implements Pick<FeedInput, 'url'> {
  @ApiProperty()
  @IsUrl({ require_tld: false })
  url: string
}

export class FeedInputDto implements FeedInput {
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

export class UpdateFeedSettingsInputDto implements UpdateFeedSettingsInput {
  @ApiProperty()
  expandContent: boolean

  @ApiProperty()
  includeRead: boolean

  @ApiProperty({ enum: Sort, enumName: 'Sort' })
  order: Sort

  @ApiProperty({ required: false })
  title?: string
}

export class FeedResponseDto implements FeedResponse {
  @ApiProperty()
  feedUrl: string

  @ApiProperty()
  id: string

  @ApiProperty()
  originalTitle: string

  @ApiPropertyOptional()
  title?: string
}

export class UserFeedResponseDto implements UserFeedResponse {
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
  tags: TagResponseDto[]
}

export class TagFeedInputDto {
  @ApiProperty()
  tagId: string
}
