import { join } from 'path'

import { TypeOrmModuleOptions } from '@nestjs/typeorm'

import { Article, Feed, User } from '@plusone/feeds/backend/database'

const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5434,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'super_secret',
  database: process.env.DB_NAME || 'feeds',
  entities: [Article, Feed, User],
  autoLoadEntities: true,
  migrations: [join(__dirname, '../**/_migrations_/**/*{.js,.ts}')],
  migrationsRun: true,
  cli: {
    migrationsDir: 'libs/feeds/backend/database/src/_migrations_',
  },
}

export = ormConfig
