import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'

import { PrismaClient } from './client/client'

const ELGATO_DATABASE_URL = 'ELGATO_DATABASE_URL'
const ELGATO_LIBS_DIRECTORY = './libs/elgato/persistence/src/lib/'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const providedUrl = process.env[ELGATO_DATABASE_URL]
    if (typeof providedUrl === 'undefined') {
      throw new Error(`Missing environment variable '${ELGATO_DATABASE_URL}'`)
    }

    if (!providedUrl.startsWith('file:')) {
      throw new Error(`Invalid environment variable '${ELGATO_DATABASE_URL}': must start with 'file:'`)
    }

    const filePath = providedUrl.replace('file:', '')

    let url = providedUrl
    if (!existsSync(filePath)) {
      console.debug(`File '${filePath}' does not exist, checking libs directory`)
      const libFilePath = join('./', ELGATO_LIBS_DIRECTORY, filePath)
      console.debug(`Checking if file '${libFilePath}' exists.`)
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
