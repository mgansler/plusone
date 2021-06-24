import { IsUrl } from 'class-validator'

export class FeedDiscoverDto {
  @IsUrl()
  url: string
}

export class FeedInputDto extends FeedDiscoverDto {
  title?: string

  @IsUrl()
  feedUrl: string
}
