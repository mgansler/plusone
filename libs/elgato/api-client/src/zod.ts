/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Elgato API
 * OpenAPI spec version: 0.1
 */
import { z as zod } from 'zod'

export const discoveredDevicesResponse = zod
  .object({
    devices: zod.array(
      zod
        .object({
          id: zod.string(),
          macAddress: zod.string(),
          name: zod.string(),
          fqdn: zod.string(),
          host: zod.string(),
          ipv4: zod.string().nullish(),
          port: zod.number(),
          displayName: zod.string(),
          productName: zod.string(),
          type: zod.enum(['RingLight', 'LightStrip', 'Unknown']),
          isControlled: zod.boolean(),
        })
        .strict(),
    ),
  })
  .strict()

export const addDiscoveredDeviceParams = zod
  .object({
    deviceId: zod.string(),
  })
  .strict()

export const addManualDeviceParams = zod
  .object({
    address: zod.string(),
  })
  .strict()

export const deviceListResponse = zod
  .object({
    devices: zod.array(
      zod
        .object({
          macAddress: zod.string(),
          displayName: zod.string(),
        })
        .strict(),
    ),
  })
  .strict()

export const deviceDetailsParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const deviceDetailsResponse = zod
  .object({
    macAddress: zod.string(),
    displayName: zod.string(),
    details: zod
      .object({
        productName: zod.string(),
        deviceType: zod.enum(['RingLight', 'LightStrip', 'Unknown']),
        displayName: zod.string(),
      })
      .strict(),
    state: zod
      .object({
        on: zod.boolean(),
        hue: zod.number().nullish(),
        saturation: zod.number().nullish(),
        brightness: zod.number().nullish(),
        temperature: zod.number().nullish(),
      })
      .strict(),
    lastSeen: zod.string().datetime().nullable(),
  })
  .strict()

export const setDisplayNameParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const setDisplayNameBody = zod
  .object({
    displayName: zod.string(),
  })
  .strict()

export const toggleDeviceParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const deviceSetPowerStateParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const deviceSetPowerStateBody = zod
  .object({
    on: zod.boolean(),
    hue: zod.number().nullish(),
    saturation: zod.number().nullish(),
    brightness: zod.number().nullish(),
    temperature: zod.number().nullish(),
  })
  .strict()

export const transitionToColorParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const transitionToColorBody = zod
  .object({
    hue: zod.number(),
    saturation: zod.number(),
    brightness: zod.number(),
  })
  .strict()

export const currentDeviceSettingsParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const currentDeviceSettingsResponse = zod
  .object({
    sunrise: zod.boolean(),
    sunset: zod.boolean(),
  })
  .strict()

export const updateDeviceSettingsParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const updateDeviceSettingsBody = zod
  .object({
    sunrise: zod.boolean().optional(),
    sunset: zod.boolean().optional(),
  })
  .strict()

export const updateDeviceSettingsResponse = zod
  .object({
    sunrise: zod.boolean(),
    sunset: zod.boolean(),
  })
  .strict()

export const updateLocationBody = zod
  .object({
    longitude: zod.number(),
    latitude: zod.number(),
    name: zod.string(),
  })
  .strict()

export const currentLocationResponse = zod
  .object({
    longitude: zod.number(),
    latitude: zod.number(),
    name: zod.string(),
  })
  .strict()

export const getLocationDataResponse = zod
  .object({
    longitude: zod.number(),
    latitude: zod.number(),
    name: zod.string(),
    sunrise: zod.string().datetime(),
    sunset: zod.string().datetime(),
    firstLight: zod.string().datetime().nullable(),
    lastLight: zod.string().datetime().nullable(),
    dawn: zod.string().datetime(),
    dusk: zod.string().datetime(),
    solarNoon: zod.string().datetime(),
    goldenHour: zod.string().datetime(),
    dayLength: zod.number(),
    timeZone: zod.string(),
    utcOffset: zod.number(),
  })
  .strict()

/**
 * @summary Trigger a predefined command via apple shortcuts.
 */
export const triggerAppleShortcutsCommandParams = zod
  .object({
    hash: zod.string(),
  })
  .strict()

/**
 * @summary Toggles devices on and off.
 */
export const toggleDevicePowerStateParams = zod
  .object({
    macAddress: zod.string(),
  })
  .strict()

export const createCommandBody = zod
  .object({
    name: zod.string(),
    actions: zod.array(
      zod
        .object({
          on: zod.boolean(),
          hue: zod.number().nullish(),
          saturation: zod.number().nullish(),
          brightness: zod.number().nullish(),
          temperature: zod.number().nullish(),
          powerOnly: zod.boolean(),
          macAddress: zod.string(),
        })
        .strict(),
    ),
  })
  .strict()

export const getCommandsResponse = zod
  .object({
    commands: zod.array(
      zod
        .object({
          name: zod.string(),
          actions: zod.array(
            zod
              .object({
                on: zod.boolean(),
                hue: zod.number().nullish(),
                saturation: zod.number().nullish(),
                brightness: zod.number().nullish(),
                temperature: zod.number().nullish(),
                powerOnly: zod.boolean(),
                macAddress: zod.string(),
                id: zod.number(),
                commandId: zod.number(),
              })
              .strict(),
          ),
          id: zod.number(),
          hash: zod.string(),
        })
        .strict(),
    ),
  })
  .strict()

export const getCommandParams = zod
  .object({
    commandId: zod.number(),
  })
  .strict()

export const getCommandResponse = zod
  .object({
    name: zod.string(),
    actions: zod.array(
      zod
        .object({
          on: zod.boolean(),
          hue: zod.number().nullish(),
          saturation: zod.number().nullish(),
          brightness: zod.number().nullish(),
          temperature: zod.number().nullish(),
          powerOnly: zod.boolean(),
          macAddress: zod.string(),
          id: zod.number(),
          commandId: zod.number(),
        })
        .strict(),
    ),
    id: zod.number(),
    hash: zod.string(),
  })
  .strict()

export const updateCommandParams = zod
  .object({
    commandId: zod.number(),
  })
  .strict()

export const updateCommandBody = zod
  .object({
    name: zod.string(),
    actions: zod.array(
      zod
        .object({
          on: zod.boolean(),
          hue: zod.number().nullish(),
          saturation: zod.number().nullish(),
          brightness: zod.number().nullish(),
          temperature: zod.number().nullish(),
          powerOnly: zod.boolean(),
          macAddress: zod.string(),
        })
        .strict(),
    ),
  })
  .strict()

export const deleteCommandParams = zod
  .object({
    commandId: zod.number(),
  })
  .strict()
