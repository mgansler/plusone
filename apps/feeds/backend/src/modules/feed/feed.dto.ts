import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUrl } from 'class-validator'

import { DiscoverResponse, FeedInput, FeedResponse, Sort, UserFeedResponse } from '@plusone/feeds/shared/types'

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

export class FeedInputDto extends FeedDiscoverDto implements FeedInput {
  @ApiProperty()
  title?: string

  @ApiProperty()
  @IsUrl()
  feedUrl: string
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
}
