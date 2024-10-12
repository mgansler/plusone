import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'
import { of } from 'rxjs'

import { GeographicalCoordinates, SunriseSunsetApiService } from './sunrise-sunset-api.service'

describe('SunriseSunsetApiService', () => {
  let sunriseSunsetApiService: SunriseSunsetApiService
  let httpService: HttpService

  let httpGetSpy: jest.SpyInstance

  const coordinates: GeographicalCoordinates = { latitude: 48.77, longitude: 9.16 }

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(1970, 0, 1, 1, 0, 0, 0))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useValue: new HttpService(),
        },
        SunriseSunsetApiService,
      ],
    }).compile()

    sunriseSunsetApiService = moduleRef.get<SunriseSunsetApiService>(SunriseSunsetApiService)
    httpService = moduleRef.get<HttpService>(HttpService)

    httpGetSpy = jest.spyOn(httpService, 'get')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getLocationData', () => {
    it('should get the location data for the stored location', async () => {
      httpGetSpy.mockReturnValue(
        of({
          data: {
            status: 'OK',
            results: [
              {
                date: '1970-01-01',
                sunrise: '7:28:58 AM',
                sunset: '6:57:14 PM',
                first_light: null,
                last_light: null,
                dawn: '6:57:33 AM',
                dusk: '7:28:39 PM',
                solar_noon: '1:13:06 PM',
                golden_hour: '6:15:06 PM',
                day_length: '11:28:15',
                timezone: 'Europe/Berlin',
                utc_offset: 120,
              },
            ],
          },
        }),
      )

      const actual = await sunriseSunsetApiService.getLocationData(coordinates)

      expect(actual).toEqual([
        {
          date: '1970-01-01',
          dawn: new Date(1970, 0, 1, 6, 57, 33),
          dayLength: 41295,
          dusk: new Date(1970, 0, 1, 19, 28, 39),
          firstLight: null,
          goldenHour: new Date(1970, 0, 1, 18, 15, 6),
          lastLight: null,
          solarNoon: new Date(1970, 0, 1, 13, 13, 6),
          sunrise: new Date(1970, 0, 1, 7, 28, 58),
          sunset: new Date(1970, 0, 1, 18, 57, 14),
          timeZone: 'Europe/Berlin',
          utcOffset: 120,
        },
      ])
    })
  })

  it('should make an actual call', async () => {
    await expect(sunriseSunsetApiService.getLocationData(coordinates)).resolves.not.toThrow()
  })
})
