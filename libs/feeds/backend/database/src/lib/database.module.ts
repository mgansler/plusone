import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

import * as ormConfig from './ormConfig'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Promise.resolve({
          ...ormConfig,
          port: Number(process.env.DB_PORT) || (ormConfig as PostgresConnectionOptions).port,
          username: process.env.DB_USER || (ormConfig as PostgresConnectionOptions).username,
          password: process.env.DB_PASS || (ormConfig as PostgresConnectionOptions).password,
          database: process.env.DB_NAME || (ormConfig as PostgresConnectionOptions).database,
        } as PostgresConnectionOptions),
    }),
  ],
  exports: [],
})
export class DatabaseModule {}
