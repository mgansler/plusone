import { Connection } from 'mongoose'
import { Provider } from '@nestjs/common'

import { DATABASE_CONNECTION } from '@feeds/database'

import { FeedSchema } from './feed.schema'

export const feedsProviders: Provider[] = [
  {
    provide: 'FEED_MODEL',
    useFactory: (connection: Connection) => connection.model('Feed', FeedSchema),
    inject: [DATABASE_CONNECTION],
  },
]
