import { Provider } from '@nestjs/common'
import { Connection } from 'mongoose'

import { DATABASE_CONNECTION } from '@feeds/database'

import { ARTICLE_MODEL, ARTICLE_MODEL_NAME } from './article.constants'
import { ArticleSchema } from './article.schema'

export const articleProviders: Provider[] = [
  {
    provide: ARTICLE_MODEL,
    useFactory: (connection: Connection) => connection.model(ARTICLE_MODEL_NAME, ArticleSchema),
    inject: [DATABASE_CONNECTION],
  },
]
