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
  @IsUrl()
  url: string
}

export class FeedInputDto implements FeedInput {
  @ApiProperty({ required: false })
  @ValidateIf((o) => typeof o.url !== 'undefined')
  @IsUrl()
  url?: string

  @ApiProperty()
  title?: string

  @ApiProperty()
  @IsUrl()
  feedUrl: string
}

export class UpdateFeedSettingsInputDto implements UpdateFeedSettingsInput {
  @ApiProperty()
  expandContent: boolean

  @ApiProperty()
  includeRead: boolean

  @ApiProperty({ enum: Sort, enumName: 'Sort' })
  order: Sort
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
}
