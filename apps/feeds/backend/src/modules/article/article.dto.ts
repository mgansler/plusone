import { IsBoolean } from 'class-validator'

import { ToggleUnreadRequest } from '@plusone/feeds/shared/types'

export class ArticleToggleUnreadDto implements ToggleUnreadRequest {
  @IsBoolean()
  unread: boolean
}
