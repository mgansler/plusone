import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'

import { PrismaClient } from './client/client'

const STGTRAILS_DATABASE_URL = 'STGTRAILS_DATABASE_URL'
const STGTRAILS_LIBS_DIRECTORY = './libs/stgtrails/persistence/src/lib/'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const providedUrl = process.env[STGTRAILS_DATABASE_URL]
    if (typeof providedUrl === 'undefined') {
      throw new Error(`Missing environment variable '${STGTRAILS_DATABASE_URL}'`)
    }

    if (!providedUrl.startsWith('file:')) {
      throw new Error(`Invalid environment variable '${STGTRAILS_DATABASE_URL}': must start with 'file:'`)
    }

    const filePath = providedUrl.replace('file:', '')

    let url = providedUrl
    if (!existsSync(filePath)) {
      const libFilePath = join('./', STGTRAILS_LIBS_DIRECTORY, filePath)
      if (!existsSync(libFilePath)) {
        throw new Error(`File '${libFilePath}' does not exist`)
      }
      url = `file:${libFilePath}`
    }

    super({
      adapter: new PrismaBetterSQLite3({ url }),
      log: process.env['PRINT_PRISMA_QUERIES'] === 'y' ? ['query'] : [],
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
