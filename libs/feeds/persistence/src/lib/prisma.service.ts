import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from './client/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.FEEDS_DATABASE_URL }),
      log: process.env['PRINT_PRISMA_QUERIES'] === 'y' ? ['query'] : [],
      omit: { user: { password: true, refreshToken: true } },
    })
  }

  async onModuleInit() {
    await this.$connect()
    // https://github.com/prisma/prisma/issues/5026
    // // @ts-expect-error false positive: we push 'query' into the options in the constructor
    // this.$on('query', (e: Prisma.QueryEvent) => {
    //   this.logger.debug(`${e.query} ${e.params}`)
    // })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
