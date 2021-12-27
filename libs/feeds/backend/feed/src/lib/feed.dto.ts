import { IsUrl } from 'class-validator'

import { FeedInput } from '@plusone/feeds/shared/types'

export class FeedDiscoverDto implements Pick<FeedInput, 'url'> {
  @IsUrl()
  url: string
}

export class FeedInputDto extends FeedDiscoverDto implements FeedInput {
  title?: string

  @IsUrl()
  feedUrl: string
}
