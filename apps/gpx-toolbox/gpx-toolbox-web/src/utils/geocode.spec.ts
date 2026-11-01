import { afterEach, describe, expect, it, vi } from 'vitest'

import { geocodePlace } from './geocode'

describe('geocodePlace', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('queries Open-Meteo and builds a label that tells places with the same name apart', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: 1, name: 'Neustadt', latitude: 48.1, longitude: 9.1, admin2: 'Kreis A', admin1: 'BW', country: 'DE' },
          { id: 2, name: 'Neustadt', latitude: 49.2, longitude: 8.2, admin1: 'RP', country: 'DE' },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const results = await geocodePlace('Neustadt a.d. Weinstraße', 2)

    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search')
    expect(url.searchParams.get('name')).toBe('Neustadt a.d. Weinstraße')
    expect(url.searchParams.get('count')).toBe('2')
    expect(results).toEqual([
      { id: 1, lat: 48.1, lng: 9.1, label: 'Neustadt, Kreis A, BW, DE' },
      { id: 2, lat: 49.2, lng: 8.2, label: 'Neustadt, RP, DE' },
    ])
  })

  it('returns an empty list when nothing was found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))

    expect(await geocodePlace('Atlantis')).toEqual([])
  })

  it('throws when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    await expect(geocodePlace('Stuttgart')).rejects.toThrow('Geocoding failed: 503')
  })
})
