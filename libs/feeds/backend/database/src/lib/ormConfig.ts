import { join } from 'path'

import { TypeOrmModuleOptions } from '@nestjs/typeorm'

import { Article, Feed, User } from './entity'

// This matches the database config in docker-compose.distributed.yml
const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5434,
  username: 'postgres',
  password: 'super_secret',
  database: 'feeds',
  entities: [Article, Feed, User],
  autoLoadEntities: true,
  migrations: [join(__dirname, '/_migrations_/**/*.js')],
  migrationsRun: true,
  cli: {
    migrationsDir: 'libs/feeds/backend/database/src/_migrations_',
  },
}

export = ormConfig
