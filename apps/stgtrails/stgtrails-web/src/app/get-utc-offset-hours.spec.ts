import * as process from 'node:process'

import { afterEach, beforeEach } from 'vitest'

import { getUtcOffsetHours } from './get-utc-offset-hours'

describe('getUtcOffsetHours', () => {
  let originalTimezone: string | undefined

  beforeEach(() => {
    originalTimezone = process.env.TZ
    process.env.TZ = 'Europe/Berlin'
    vi.useFakeTimers()
    vi.setSystemTime('2024-10-01T13:00:00.000Z')
  })

  afterEach(() => {
    vi.useRealTimers()
    if (typeof originalTimezone === 'undefined') {
      delete process.env.TZ
    } else {
      process.env.TZ = originalTimezone
    }
  })

  it.each([
    { expectedOffset: 20, timezone: 'America/New_York' },
    { expectedOffset: 0, timezone: 'UTC' },
    { expectedOffset: 2, timezone: 'Europe/Berlin' },
  ])('should return offset of "$expectedOffset" for timezone "$timezone"', ({ expectedOffset, timezone }) => {
    process.env.TZ = timezone

    expect(getUtcOffsetHours()).toEqual(expectedOffset)
  })

  it('should work during the day', () => {
    expect(getUtcOffsetHours()).toEqual(2)
  })

  it('should work around midnight', () => {
    vi.setSystemTime('2024-10-01T23:00:00.000Z')

    expect(getUtcOffsetHours()).toEqual(2)
  })
})
