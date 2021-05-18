import { Connection } from 'mongoose'
import { Provider } from '@nestjs/common'

import { DATABASE_CONNECTION } from '@plusone/feeds/database'

import { FeedSchema } from './feed.schema'
import { FEED_MODEL, FEED_MODEL_NAME } from './feed.constants'

export const feedProviders: Provider[] = [
  {
    provide: FEED_MODEL,
    useFactory: (connection: Connection) => connection.model(FEED_MODEL_NAME, FeedSchema),
    inject: [DATABASE_CONNECTION],
  },
]
