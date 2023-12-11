import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TARGET_DIRECTORY = join('node_modules', '@angular', 'compiler-cli', 'bundles')
const MAX_TS_VERSION_OVERWRITE = '5.3.4'

const files = readdirSync(TARGET_DIRECTORY).filter((file) => file.startsWith('chunk') && file.endsWith('.js'))
for (const file of files) {
  const content = readFileSync(join(TARGET_DIRECTORY, file), { encoding: 'utf-8' })
  if (content.includes('var MAX_TS_VERSION =')) {
    const patched = content.replace(
      /var MAX_TS_VERSION = "\d.\d.\d";/,
      `var MAX_TS_VERSION = "${MAX_TS_VERSION_OVERWRITE}";`,
    )
    writeFileSync(join(TARGET_DIRECTORY, file), patched, { encoding: 'utf-8' })
    console.log('Patched supported TypeScript version.')
  }
}
