import { Test, TestingModule } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'

import { BRouterService } from './brouter.service'

describe('BRouterService', () => {
  let service: BRouterService

  const mockResponse = {
    data: '<?xml version="1.0"?><gpx>route</gpx>',
  }

  const mockHttpService = {
    get: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [BRouterService, { provide: HttpService, useValue: mockHttpService }],
    }).compile()

    service = module.get<BRouterService>(BRouterService)
  })

  describe('getRoute', () => {
    it('should use default profile fastbike when no profile is provided', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      await service.getRoute('https://bikerouter.de', [
        { latitude: 48.78, longitude: 9.15 },
        { latitude: 48.79, longitude: 9.14 },
      ])

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.15,48.78|9.14,48.79',
          profile: 'mtb-zossebart',
          alternativeidx: 0,
          format: 'gpx',
        },
      })
    })

    it('should use the provided profile', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      await service.getRoute(
        'https://bikerouter.de',
        [
          { latitude: 48.78, longitude: 9.15 },
          { latitude: 48.79, longitude: 9.14 },
        ],
        'trekking',
      )

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.15,48.78|9.14,48.79',
          profile: 'trekking',
          alternativeidx: 0,
          format: 'gpx',
        },
      })
    })

    it('should format lonlats correctly from coordinate objects', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      await service.getRoute('https://bikerouter.de', [
        { latitude: 48.787212, longitude: 9.150592 },
        { latitude: 48.788245, longitude: 9.144766 },
      ])

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.150592,48.787212|9.144766,48.788245',
          profile: 'mtb-zossebart',
          alternativeidx: 0,
          format: 'gpx',
        },
      })
    })

    it('should return response data wrapped in gpx property', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      const result = await service.getRoute('https://bikerouter.de', [
        { latitude: 48.78, longitude: 9.15 },
        { latitude: 48.79, longitude: 9.14 },
      ])

      expect(result).toEqual({ gpx: '<?xml version="1.0"?><gpx>route</gpx>' })
    })

    it('should handle multiple via points', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      await service.getRoute(
        'https://bikerouter.de',
        [
          { latitude: 48.787212, longitude: 9.150592 },
          { latitude: 48.7878, longitude: 9.148 },
          { latitude: 48.788245, longitude: 9.144766 },
        ],
        'mtb-zossebart',
      )

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.150592,48.787212|9.148,48.7878|9.144766,48.788245',
          profile: 'mtb-zossebart',
          alternativeidx: 0,
          format: 'gpx',
        },
      })
    })

    it('should use explicit alternativeIdx when provided', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      await service.getRoute(
        'https://bikerouter.de',
        [
          { latitude: 48.78, longitude: 9.15 },
          { latitude: 48.79, longitude: 9.14 },
        ],
        'fastbike',
        2,
      )

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.15,48.78|9.14,48.79',
          profile: 'fastbike',
          alternativeidx: 2,
          format: 'gpx',
        },
      })
    })
  })

  describe('getRoutes', () => {
    it('should fetch 3 route alternatives in parallel', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      await service.getRoutes('https://bikerouter.de', [
        { latitude: 48.78, longitude: 9.15 },
        { latitude: 48.79, longitude: 9.14 },
      ])

      expect(mockHttpService.get).toHaveBeenCalledTimes(3)

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.15,48.78|9.14,48.79',
          profile: 'mtb-zossebart',
          alternativeidx: 0,
          format: 'gpx',
        },
      })

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.15,48.78|9.14,48.79',
          profile: 'mtb-zossebart',
          alternativeidx: 1,
          format: 'gpx',
        },
      })

      expect(mockHttpService.get).toHaveBeenCalledWith('https://bikerouter.de/brouter-engine/brouter', {
        params: {
          lonlats: '9.15,48.78|9.14,48.79',
          profile: 'mtb-zossebart',
          alternativeidx: 2,
          format: 'gpx',
        },
      })
    })

    it('should return all 3 routes with their alternativeIdx', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      const result = await service.getRoutes('https://bikerouter.de', [
        { latitude: 48.78, longitude: 9.15 },
        { latitude: 48.79, longitude: 9.14 },
      ])

      expect(result.routes).toHaveLength(3)
      expect(result.routes[0]).toEqual({ gpx: '<?xml version="1.0"?><gpx>route</gpx>', alternativeIdx: 0 })
      expect(result.routes[1]).toEqual({ gpx: '<?xml version="1.0"?><gpx>route</gpx>', alternativeIdx: 1 })
      expect(result.routes[2]).toEqual({ gpx: '<?xml version="1.0"?><gpx>route</gpx>', alternativeIdx: 2 })
    })

    it('should use the provided profile for all alternatives', async () => {
      mockHttpService.get.mockReturnValue(of(mockResponse))

      await service.getRoutes(
        'https://bikerouter.de',
        [
          { latitude: 48.78, longitude: 9.15 },
          { latitude: 48.79, longitude: 9.14 },
        ],
        'trekking',
      )

      expect(mockHttpService.get).toHaveBeenCalledTimes(3)

      const calls = (mockHttpService.get as any).mock.calls
      calls.forEach((call) => {
        expect(call[1].params.profile).toBe('trekking')
      })
    })
  })
})
