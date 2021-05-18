import { Provider } from '@nestjs/common'
import { Connection } from 'mongoose'

import { DATABASE_CONNECTION } from '@feeds/database'

import { USER_MODEL, USER_MODEL_NAME } from './user.constants'
import { UserWithPasswordSchema } from './user.schema'

export const userProviders: Provider[] = [
  {
    provide: USER_MODEL,
    useFactory: (connection: Connection) => connection.model(USER_MODEL_NAME, UserWithPasswordSchema),
    inject: [DATABASE_CONNECTION],
  },
]
