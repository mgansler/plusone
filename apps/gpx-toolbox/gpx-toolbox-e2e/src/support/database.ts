import { join } from 'node:path'

import Database from 'better-sqlite3'

/** Created by the `setup-db` target */
const DATABASE_FILE = join(__dirname, '../../../../../libs/gpx-toolbox/persistence/gpx-toolbox-e2e.db')

/** Delete all data, so every test starts with an empty database */
export function resetDatabase(): null {
  const db = new Database(DATABASE_FILE)
  try {
    db.exec('DELETE FROM activities; DELETE FROM routes; DELETE FROM users;')
  } finally {
    db.close()
  }
  return null
}
