/**
 * Generated by orval v6.22.1 🍺
 * Do not edit manually.
 * Elgato API
 * OpenAPI spec version: 0.1
 */
import { z as zod } from 'zod'

export const deviceListResponse = zod.object({
  devices: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
      displayName: zod.string(),
    }),
  ),
})

export const deviceDetailsParams = zod.object({
  id: zod.string(),
})

export const deviceDetailsResponse = zod.object({
  id: zod.string(),
  name: zod.string(),
  displayName: zod.string(),
  groups: zod.array(
    zod.object({
      id: zod.number(),
      name: zod.string(),
      isRoom: zod.boolean(),
    }),
  ),
  details: zod.object({
    productName: zod.string(),
    deviceType: zod.enum(['RingLight', 'LightStrip', 'Unknown']),
    displayName: zod.string(),
  }),
  state: zod.object({
    on: zod.boolean(),
    hue: zod.number().optional(),
    saturation: zod.number().optional(),
    brightness: zod.number().optional(),
  }),
  lastSeen: zod.string().datetime(),
})

export const setDisplayNameParams = zod.object({
  id: zod.string(),
})

export const setDisplayNameBody = zod.object({
  displayName: zod.string(),
})

export const toggleDeviceParams = zod.object({
  id: zod.string(),
})

export const deviceSetPowerStateParams = zod.object({
  id: zod.string(),
})

export const deviceSetPowerStateBody = zod.object({
  on: zod.boolean(),
  hue: zod.number().optional(),
  saturation: zod.number().optional(),
  brightness: zod.number().optional(),
})

export const transitionToColorParams = zod.object({
  id: zod.string(),
})

export const transitionToColorBody = zod.object({
  hue: zod.number(),
  saturation: zod.number(),
  brightness: zod.number(),
})

export const addDeviceToGroupParams = zod.object({
  id: zod.string(),
})

export const addDeviceToGroupBody = zod.object({
  groupId: zod.number(),
})

export const removeDeviceFromGroupParams = zod.object({
  id: zod.string(),
})

export const removeDeviceFromGroupBody = zod.object({
  groupId: zod.number(),
})

export const currentDeviceSettingsParams = zod.object({
  id: zod.string(),
})

export const currentDeviceSettingsResponse = zod.object({
  sunrise: zod.boolean(),
  sunset: zod.boolean(),
})

export const updateDeviceSettingsParams = zod.object({
  id: zod.string(),
})

export const updateDeviceSettingsBody = zod.object({
  sunrise: zod.boolean().optional(),
  sunset: zod.boolean().optional(),
})

export const updateDeviceSettingsResponse = zod.object({
  sunrise: zod.boolean(),
  sunset: zod.boolean(),
})

export const createGroupBody = zod.object({
  name: zod.string(),
  isRoom: zod.boolean().optional(),
})

export const groupListResponse = zod.object({
  groups: zod.array(
    zod.object({
      id: zod.number(),
      name: zod.string(),
      isRoom: zod.boolean(),
    }),
  ),
})

export const groupDetailsParams = zod.object({
  groupId: zod.number(),
})

export const groupDetailsResponse = zod.object({
  id: zod.number(),
  name: zod.string(),
  isRoom: zod.boolean(),
  devices: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
      displayName: zod.string(),
      groups: zod.array(
        zod.object({
          id: zod.number(),
          name: zod.string(),
          isRoom: zod.boolean(),
        }),
      ),
      details: zod.object({
        productName: zod.string(),
        deviceType: zod.enum(['RingLight', 'LightStrip', 'Unknown']),
        displayName: zod.string(),
      }),
      state: zod.object({
        on: zod.boolean(),
        hue: zod.number().optional(),
        saturation: zod.number().optional(),
        brightness: zod.number().optional(),
      }),
      lastSeen: zod.string().datetime(),
    }),
  ),
})

export const controlGroupStateParams = zod.object({
  groupId: zod.number(),
})

export const controlGroupStateBody = zod.object({
  desiredPowerState: zod.enum(['on', 'off']),
})

export const updateLocationBody = zod.object({
  longitude: zod.number(),
  latitude: zod.number(),
  name: zod.string(),
})

export const getLocationDataResponse = zod.object({
  longitude: zod.number(),
  latitude: zod.number(),
  name: zod.string(),
  sunrise: zod.string().datetime(),
  sunset: zod.string().datetime(),
  firstLight: zod.string().datetime(),
  lastLight: zod.string().datetime(),
  dawn: zod.string().datetime(),
  dusk: zod.string().datetime(),
  solarNoon: zod.string().datetime(),
  goldenHour: zod.string().datetime(),
  dayLength: zod.number(),
  timeZone: zod.string(),
  utcOffset: zod.number(),
})

export const streamDeckControllerToggleDeviceParams = zod.object({
  deviceId: zod.string(),
})
