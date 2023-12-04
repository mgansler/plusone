import { http } from 'msw'

import { DeviceType } from '../modules/device/enum/device-type'

import { getAccessoryInfoResponse } from './accessory-info-response.stub'

export function getAccessoryInfo(deviceType: DeviceType) {
  return deviceType === DeviceType.LightStrip
    ? http.get('http://my-lightstrip-device:9123/elgato/accessory-info', () => {
        return new Response(
          JSON.stringify(
            getAccessoryInfoResponse({
              productName: 'Elgato Light Strip',
              displayName: 'My Light Strip Device',
            }),
          ),
        )
      })
    : http.get('http://my-ringlight-device:9123/elgato/accessory-info', () => {
        return new Response(
          JSON.stringify(
            getAccessoryInfoResponse({
              productName: 'Elgato Ring Light',
              displayName: 'My Ring Light Device',
            }),
          ),
        )
      })
}

export function getLights(deviceType: DeviceType) {
  return deviceType === DeviceType.LightStrip
    ? http.get('http://my-lightstrip-device:9123/elgato/lights', () => {
        return new Response(
          JSON.stringify({
            numberOfLights: 1,
            lights: [{ on: 1, hue: 0, brightness: 50, saturation: 50 }],
          }),
        )
      })
    : http.get('http://my-ringlight-device:9123/elgato/lights', () => {
        return new Response(
          JSON.stringify({
            numberOfLights: 1,
            lights: [{ on: 1, temperature: 200 }],
          }),
        )
      })
}

export function getSettings() {
  return http.get('http://my-lightstrip-device:9123/elgato/lights/settings', () => {
    return new Response(
      JSON.stringify({
        colorChangeDurationMs: 0,
        powerOnBehavior: 0,
        powerOnBrightness: 0,
        powerOnHue: 0,
        powerOnSaturation: 0,
        switchOffDurationMs: 0,
        switchOnDurationMs: 0,
      }),
    )
  })
}

export function getStuckDevice() {
  return http.get('http://my-stuck-device:9123/elgato/lights', () => {
    return new Response('')
  })
}
