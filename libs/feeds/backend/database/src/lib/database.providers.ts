import * as Mongoose from 'mongoose'
import { Provider } from '@nestjs/common'

import { DATABASE_CONNECTION } from './database.constants'

export const databaseProviders: Provider[] = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (): Promise<typeof Mongoose> =>
      Mongoose.connect(`mongodb://${process.env.DB_HOST}/feeds`, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
  },
]
