import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'

import type { Prisma } from './client'
import { PrismaClient } from './client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const log: Array<Prisma.LogLevel> = []
    if (process.env['PRINT_PRISMA_QUERIES'] === 'y') {
      log.push('query')
    }
    super({ log, omit: { user: { password: true, refreshToken: true } } })
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
