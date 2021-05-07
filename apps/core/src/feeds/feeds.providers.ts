import { Connection } from 'mongoose'
import { Provider } from '@nestjs/common'

import { FeedSchema } from './feed.schema'

export const feedsProviders: Provider[] = [
  {
    provide: 'FEED_MODEL',
    useFactory: (connection: Connection) => connection.model('Feed', FeedSchema),
    inject: ['DATABASE_CONNECTION'],
  },
]
