import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { StravaService } from './strava.service'

// ── Mock axios (vi.hoisted keeps it available during hoisted vi.mock) ────────
const hoisted = vi.hoisted(() => {
  const mockFn = vi.fn()
  return { mockFn }
})

vi.mock('axios', () => ({ default: hoisted.mockFn }))

describe('StravaService', () => {
  let service: StravaService

  beforeEach(async () => {
    vi.clearAllMocks()
    hoisted.mockFn.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StravaService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<StravaService>(StravaService)
  })

  describe('route methods use fetchStrava (axios)', () => {
    it('getRoute calls the routes endpoint with string ID', async () => {
      hoisted.mockFn.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: { id: 123456789012345, id_str: '123456789012345', name: 'Test' },
      })

      const result = await service.getRoute('token', '123456789012345')

      expect(result).toEqual({ id: 123456789012345, id_str: '123456789012345', name: 'Test' })
    })

    it('downloadRouteGPX throws on non-2xx response', async () => {
      hoisted.mockFn.mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
        data: { message: 'Not found' },
      })

      await expect(service.downloadRouteGPX('token', '123')).rejects.toThrow('GPX download failed: 404')
    })

    it('downloadRouteTCX throws on non-2xx response', async () => {
      hoisted.mockFn.mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Error' },
      })

      await expect(service.downloadRouteTCX('token', '123')).rejects.toThrow('TCX download failed: 500')
    })

    it('downloadRouteGPX returns GPX content on success', async () => {
      const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx><trk><trkseg><trkpt lat="48.0" lon="11.0"></trkpt></trkseg></trk></gpx>`

      hoisted.mockFn.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: gpxContent,
      })

      const result = await service.downloadRouteGPX('token', '123')

      expect(result).toContain('<gpx>')
    })
  })

  describe('fetchStrava', () => {
    it('constructs full URL from relative endpoint', async () => {
      hoisted.mockFn.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: { data: 'test' },
      })

      const result = await service.fetchStrava('/athlete', 'test-token')

      expect(result.ok).toBe(true)
      expect(hoisted.mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://www.strava.com/api/v3/athlete',
          method: 'GET',
          headers: { Authorization: 'Bearer test-token' },
          validateStatus: expect.any(Function),
        }),
      )
    })

    it('handles absolute URLs', async () => {
      hoisted.mockFn.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: { data: 'test' },
      })

      const result = await service.fetchStrava('https://www.strava.com/api/v3/athlete', 'test-token')

      expect(result.ok).toBe(true)
      expect(hoisted.mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://www.strava.com/api/v3/athlete',
        }),
      )
    })

    it('returns error response when status is not 2xx', async () => {
      hoisted.mockFn.mockResolvedValue({
        status: 401,
        statusText: 'Unauthorized',
        data: { message: 'Error' },
      })

      const result = await service.fetchStrava('/athlete', 'invalid-token')

      expect(result.ok).toBe(false)
      expect(result.status).toBe(401)
    })
  })

  describe('getAthlete', () => {
    it('calls the athlete endpoint with Bearer token', async () => {
      // getLoggedInAthlete uses axios.default.get() (OpenAPI client pattern)
      hoisted.mockFn.get = vi.fn().mockResolvedValue({
        data: { id: '123', firstname: 'John', lastname: 'Doe' },
      })

      await service.getAthlete('my-secret-token')

      expect(hoisted.mockFn.get).toHaveBeenCalledWith(
        '/athlete',
        expect.objectContaining({
          headers: { Authorization: 'Bearer my-secret-token' },
        }),
      )
    })
  })

  describe('downloadActivityStreams', () => {
    // getActivityStreams uses axios.default.get() (OpenAPI client pattern)
    const streamsResponse = {
      data: {
        time: { data: [1000, 1001, 1002] },
        distance: { data: [0, 10, 20] },
        latlng: {
          data: [
            [48.0, 11.0],
            [48.1, 11.1],
            [48.2, 11.2],
          ],
        },
        altitude: { data: [100, 110, 120] },
        heartrate: { data: [140, 150, 160] },
        cadence: { data: [80, 85, 90] },
        moving: { data: [true, false, true] },
      },
    }

    beforeEach(() => {
      hoisted.mockFn.get = vi.fn().mockResolvedValue(streamsResponse)
    })

    it('merges key_by_type streams into track points', async () => {
      const result = await service.downloadActivityStreams('token', 999)

      expect(result).toEqual([
        {
          latitude: 48.0,
          longitude: 11.0,
          elevation: 100,
          time: new Date(1000000),
          hr: 140,
          cad: 80,
          moving: true,
        },
        {
          latitude: 48.1,
          longitude: 11.1,
          elevation: 110,
          time: new Date(1001000),
          hr: 150,
          cad: 85,
          moving: false,
        },
        {
          latitude: 48.2,
          longitude: 11.2,
          elevation: 120,
          time: new Date(1002000),
          hr: 160,
          cad: 90,
          moving: true,
        },
      ])
    })

    it('requests the streams endpoint with all keys and key_by_type', async () => {
      await service.downloadActivityStreams('token', 999)

      expect(hoisted.mockFn.get).toHaveBeenCalledWith(
        '/activities/999/streams',
        expect.objectContaining({
          baseURL: 'https://www.strava.com/api/v3',
          params: {
            keys: 'time,distance,latlng,altitude,heartrate,cadence,moving',
            key_by_type: true,
          },
          headers: { Authorization: 'Bearer token' },
        }),
      )
    })

    it('returns empty array when latlng stream is missing (error response)', async () => {
      hoisted.mockFn.get.mockResolvedValueOnce({
        data: { message: 'Activity not found', errors: {} },
      })

      const result = await service.downloadActivityStreams('token', 999)

      expect(result).toEqual([])
    })

    it('returns empty array when latlng stream is present but empty', async () => {
      hoisted.mockFn.get.mockResolvedValueOnce({
        data: {
          time: { data: [1000] },
          latlng: { data: [] },
        },
      })

      const result = await service.downloadActivityStreams('token', 999)

      expect(result).toEqual([])
    })
  })
})
