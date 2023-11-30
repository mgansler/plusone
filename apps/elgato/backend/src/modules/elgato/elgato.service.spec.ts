import { HttpService } from '@nestjs/axios'
import { http } from 'msw'
import { SetupServer, setupServer } from 'msw/node'

import { Device } from '@plusone/elgato-persistence'

import { ElgatoAccessoryInfoResponseDto } from './dto/elgato-accessory-info-response.dto'
import { ElgatoService } from './elgato.service'

describe('ElgatoService', () => {
  let server: SetupServer
  let elgatoService: ElgatoService
  let httpService: HttpService

  beforeAll(() => {
    server = setupServer(
      http.get('http://my-light-strip-device:9123/elgato/accessory-info', () => {
        return new Response(JSON.stringify({ productName: 'Elgato Light Strip', displayName: 'My Light Strip Device' }))
      }),
      http.get('http://my-ring-light-device:9123/elgato/accessory-info', () => {
        return new Response(JSON.stringify({ productName: 'Elgato Ring Light', displayName: 'My Ring Light Device' }))
      }),
    )
    server.listen()
  })

  beforeEach(() => {
    server.resetHandlers()
    httpService = new HttpService()
    elgatoService = new ElgatoService(httpService)
  })

  afterAll(() => {
    server.close()
  })

  describe('Light Strip', () => {
    const device: Device = {
      id: 'aa:bb:cc:dd:ee:ff',
      fqdn: 'My Light Strip Device._elg._tcp.local',
      host: 'my-light-strip-device.local',
      lastSeen: new Date(),
      name: 'My Light Strip Device',
      port: 9123,
      sunrise: false,
      sunset: false,
    }

    describe('getDeviceAccessoryInfo', () => {
      it('should return the device accessory info', async () => {
        const expected: ElgatoAccessoryInfoResponseDto = {
          displayName: 'My Light Strip Device',
          productName: 'Elgato Light Strip',
        }
        const actual = await elgatoService.getDeviceAccessoryInfo(device)

        expect(actual).toStrictEqual(expected)
      })
    })
  })

  describe('Ring Light', () => {
    const device: Device = {
      id: 'aa:bb:cc:dd:ee:ff',
      fqdn: 'My Ring Light Device._elg._tcp.local',
      host: 'my-ring-light-device.local',
      lastSeen: new Date(),
      name: 'My Ring Light Device',
      port: 9123,
      sunrise: false,
      sunset: false,
    }

    describe('getDeviceAccessoryInfo', () => {
      it('should return the device accessory info', async () => {
        const expected: ElgatoAccessoryInfoResponseDto = {
          displayName: 'My Ring Light Device',
          productName: 'Elgato Ring Light',
        }
        const actual = await elgatoService.getDeviceAccessoryInfo(device)

        expect(actual).toStrictEqual(expected)
      })
    })
  })
})
