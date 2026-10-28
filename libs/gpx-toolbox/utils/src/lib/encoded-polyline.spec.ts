import { describe, expect, it } from 'vitest'

import { decodePolyline } from './encoded-polyline'

describe('decodePolyline', () => {
  it('returns an empty array for an empty string', () => {
    expect(decodePolyline('')).toEqual([])
  })

  it('decodes the example from the Google documentation', () => {
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toEqual([
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 40.7, longitude: -120.95 },
      { latitude: 43.252, longitude: -126.453 },
    ])
  })
})
