import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3'

const ELGATO_DATABASE_URL = 'ELGATO_DATABASE_URL'
const ELGATO_LIBS_DIRECTORY = './libs/elgato/persistence/src/lib/'

export function createAdapter(): PrismaBetterSQLite3 {
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
    const libFilePath = join('./', ELGATO_LIBS_DIRECTORY, filePath)
    if (!existsSync(libFilePath)) {
      throw new Error(`File '${libFilePath}' does not exist`)
    }
    url = `file:${libFilePath}`
  }

  return new PrismaBetterSQLite3({ url }, { timestampFormat: 'unixepoch-ms' })
}
