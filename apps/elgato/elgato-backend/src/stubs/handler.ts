import { http, HttpResponse } from 'msw'

import { DeviceType } from '../modules/device/enum/device-type'

import { getAccessoryInfoResponseStub } from './accessory-info-response.stub'

export function getAccessoryInfo(deviceType: keyof typeof DeviceType) {
  return deviceType === DeviceType.LightStrip
    ? http.get('http://my-lightstrip-device:9123/elgato/accessory-info', () => {
        return HttpResponse.json(
          getAccessoryInfoResponseStub({
            productName: 'Elgato Light Strip',
            displayName: 'My Light Strip Device',
          }),
        )
      })
    : http.get('http://my-ringlight-device:9123/elgato/accessory-info', () => {
        return HttpResponse.json(
          getAccessoryInfoResponseStub({
            productName: 'Elgato Ring Light',
            displayName: 'My Ring Light Device',
          }),
        )
      })
}

export function getLights(deviceType: keyof typeof DeviceType) {
  return deviceType === DeviceType.LightStrip
    ? http.get('http://my-lightstrip-device:9123/elgato/lights', () => {
        return HttpResponse.json({
          numberOfLights: 1,
          lights: [{ on: 1, hue: 0, brightness: 50, saturation: 50 }],
        })
      })
    : http.get('http://my-ringlight-device:9123/elgato/lights', () => {
        return HttpResponse.json({
          numberOfLights: 1,
          lights: [{ on: 1, temperature: 200 }],
        })
      })
}

export function getSettings() {
  return http.get('http://my-lightstrip-device:9123/elgato/lights/settings', () => {
    return HttpResponse.json({
      colorChangeDurationMs: 0,
      powerOnBehavior: 0,
      powerOnBrightness: 0,
      powerOnHue: 0,
      powerOnSaturation: 0,
      switchOffDurationMs: 0,
      switchOnDurationMs: 0,
    })
  })
}

export function getStuckDevice() {
  return http.get('http://my-stuck-device:9123/elgato/lights', () => {
    return new Response('')
  })
}

export function putState(deviceType: keyof typeof DeviceType) {
  return deviceType === DeviceType.LightStrip
    ? http.put('http://my-lightstrip-device:9123/elgato/lights', () => {
        return HttpResponse.json({
          numberOfLights: 1,
          lights: [
            {
              on: 1,
              hue: 37.0,
              saturation: 100.0,
              brightness: 33,
            },
          ],
        })
      })
    : http.put('http://my-ringlight-device:9123/elgato/lights', () => {
        return HttpResponse.json({
          numberOfLights: 1,
          lights: [
            {
              on: 1,
              brightness: 43,
              temperature: 43,
            },
          ],
        })
      })
}

export function doesNotResolve() {
  return http.all('http://does-not-resolve:9123/*', () => HttpResponse.error())
}

export function postIdentify() {
  return http.post('http://identify:9123/elgato/identify', () => {
    return new Response('')
  })
}

export function setDisplayName() {
  return http.put('http://display-name:9123/elgato/accessory-info', async ({ request }) => {
    const data = (await request.json()) as { displayName: string }
    if (data.displayName !== 'My new Display Name') {
      return new HttpResponse('displayName is missing', { status: 400 })
    }

    return new Response('')
  })
}
