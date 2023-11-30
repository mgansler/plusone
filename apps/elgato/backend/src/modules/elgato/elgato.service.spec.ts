import { HttpService } from '@nestjs/axios'
import { http } from 'msw'
import { SetupServer, setupServer } from 'msw/node'

import { getDevice } from '../../stubs/device.stub'
import { DeviceType } from '../device/enum/device-type'

import { ElgatoAccessoryInfoResponseDto } from './dto/elgato-accessory-info-response.dto'
import { ElgatoService } from './elgato.service'

describe('ElgatoService', () => {
  let server: SetupServer
  let elgatoService: ElgatoService
  let httpService: HttpService

  beforeAll(() => {
    server = setupServer(
      http.get('http://my-lightstrip-device:9123/elgato/accessory-info', () => {
        return new Response(JSON.stringify({ productName: 'Elgato Light Strip', displayName: 'My Light Strip Device' }))
      }),
      http.get('http://my-ringlight-device:9123/elgato/accessory-info', () => {
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

  describe('getDeviceAccessoryInfo', () => {
    it.each([
      { type: DeviceType.RingLight, displayName: 'My Ring Light Device', productName: 'Elgato Ring Light' },
      { type: DeviceType.LightStrip, displayName: 'My Light Strip Device', productName: 'Elgato Light Strip' },
    ])('should return the device accessory info for a $type', async ({ type, displayName, productName }) => {
      const expected: ElgatoAccessoryInfoResponseDto = { displayName, productName }
      const actual = await elgatoService.getDeviceAccessoryInfo(getDevice(type))

      expect(actual).toStrictEqual(expected)
    })
  })
})
