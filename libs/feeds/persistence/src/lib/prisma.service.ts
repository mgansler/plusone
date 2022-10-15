import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'

import { PrismaClient } from './client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(PrismaService.name)

  constructor() {
    const log = []
    if (process.env['PRINT_PRISMA_QUERIES'] === 'y') {
      log.push('query')
    }
    super({ log })
  }

  async onModuleInit() {
    await this.$connect()
    // https://github.com/prisma/prisma/issues/5026
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // this.$on('query', async (e) => {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   this.logger.debug(`${e.query} ${e.params}`)
    // })
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
