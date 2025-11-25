import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const STGTRAILS_DATABASE_URL = 'STGTRAILS_DATABASE_URL'
const STGTRAILS_DIRECTORY = './libs/stgtrails/persistence/'

export function createAdapter(): PrismaBetterSqlite3 {
  const providedUrl = process.env[STGTRAILS_DATABASE_URL]
  if (!providedUrl) {
    throw new Error(`Missing environment variable '${STGTRAILS_DATABASE_URL}'`)
  }

  if (!providedUrl.startsWith('file:')) {
    throw new Error(`Invalid environment variable '${STGTRAILS_DATABASE_URL}': must start with 'file:'`)
  }

  const filePath = providedUrl.replace('file:', '')

  let url = providedUrl
  if (!existsSync(filePath)) {
    const libFilePath = join('./', STGTRAILS_DIRECTORY, filePath)
    if (!existsSync(libFilePath)) {
      throw new Error(`File '${libFilePath}' does not exist`)
    }
    url = `file:${libFilePath}`
  }

  return new PrismaBetterSqlite3({ url }, { timestampFormat: 'unixepoch-ms' })
}
