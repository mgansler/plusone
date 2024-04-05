import { HttpService } from '@nestjs/axios'
import { Test } from '@nestjs/testing'
import { of } from 'rxjs'

import { PrismaService } from '@plusone/elgato-persistence'

import { LocationService } from './location.service'

describe('LocationService', () => {
  let locationService: LocationService
  let prismaService: PrismaService
  let httpService: HttpService

  let httpGetSpy: jest.SpyInstance

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
          provide: PrismaService,
          useValue: {
            location: {
              findFirstOrThrow: jest.fn(),
            },
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        LocationService,
      ],
    }).compile()

    locationService = moduleRef.get<LocationService>(LocationService)
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    httpService = moduleRef.get<HttpService>(HttpService)

    httpGetSpy = jest.spyOn(httpService, 'get')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getLocationData', () => {
    it('should get the location data for the stored location', async () => {
      jest.spyOn(prismaService.location, 'findFirstOrThrow').mockResolvedValue({
        name: 'Stuttgart',
        latitude: 48.77,
        longitude: 9.16,
      })

      httpGetSpy.mockReturnValue(
        of({
          data: {
            status: 'OK',
            results: {
              sunrise: '7:28:58 AM',
              sunset: '6:57:14 PM',
              first_light: '5:44:00 AM',
              last_light: '8:42:13 PM',
              dawn: '6:57:33 AM',
              dusk: '7:28:39 PM',
              solar_noon: '1:13:06 PM',
              golden_hour: '6:15:06 PM',
              day_length: '11:28:15',
              timezone: 'Europe/Berlin',
              utc_offset: 120,
            },
          },
        }),
      )

      const actual = await locationService.getLocationData()

      expect(actual).toEqual({
        name: 'Stuttgart',
        latitude: 48.77,
        longitude: 9.16,
        dawn: new Date(1970, 0, 1, 6, 57, 33),
        dayLength: 41295,
        dusk: new Date(1970, 0, 1, 19, 28, 39),
        firstLight: new Date(1970, 0, 1, 5, 44, 0),
        goldenHour: new Date(1970, 0, 1, 18, 15, 6),
        lastLight: new Date(1970, 0, 1, 20, 42, 13),
        solarNoon: new Date(1970, 0, 1, 13, 13, 6),
        sunrise: new Date(1970, 0, 1, 7, 28, 58),
        sunset: new Date(1970, 0, 1, 18, 57, 14),
        timeZone: 'Europe/Berlin',
        utcOffset: 120,
      })
    })
  })
})
