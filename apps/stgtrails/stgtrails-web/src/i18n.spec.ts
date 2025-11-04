import { expect } from 'vitest'

describe('i18n', () => {
  const languages = ['en', 'de']

  it.each(languages)('all translation files should have the same keys: %s', (language) => {
    const referenceKeys = extractKeys(require(`../public/locales/en/translation.json`))

    const keys = extractKeys(require(`../public/locales/${language}/translation.json`))

    expect(referenceKeys).toEqual(keys)
  })
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractKeys(obj: any, prefix = ''): Array<string> {
  const keys: Array<string> = []

  for (const key in obj) {
    if (obj[key]) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...extractKeys(obj[key], fullKey))
      } else {
        keys.push(fullKey)
      }
    }
  }

  return keys
}
