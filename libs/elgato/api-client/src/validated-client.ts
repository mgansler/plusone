import type { z } from 'zod'

import { ValidatedClientBuilder } from '@plusone/validated-query-factory'

import {
  currentDeviceSettings,
  currentLocation,
  deviceDetails,
  deviceList,
  discoveredDevices,
  useCurrentDeviceSettings,
  useCurrentLocation,
  useDeviceDetails,
  useDeviceList,
  useDiscoveredDevices,
} from './client'
import {
  currentDeviceSettingsResponse,
  currentLocationResponse,
  deviceDetailsResponse,
  deviceListResponse,
  discoveredDevicesResponse,
} from './zod'

export type DiscoveredDevicesResponse = z.infer<typeof discoveredDevicesResponse>
export const useValidatedDiscoveredDevicesList = new ValidatedClientBuilder(discoveredDevicesResponse)
  .withFetchWrapper(discoveredDevices)
  .withUseQueryWrapper(useDiscoveredDevices)

export type DeviceListResponse = z.infer<typeof deviceListResponse>
export const useValidatedDeviceList = new ValidatedClientBuilder(deviceListResponse)
  .withFetchWrapper(deviceList)
  .withUseQueryWrapper(useDeviceList)

export type DeviceDetailsResponse = z.infer<typeof deviceDetailsResponse>
export const useValidatedDeviceDetails = new ValidatedClientBuilder(deviceDetailsResponse)
  .withFetchWrapper(deviceDetails)
  .withUseQueryWrapper(useDeviceDetails)

export const useValidatedDeviceSettings = new ValidatedClientBuilder(currentDeviceSettingsResponse)
  .withFetchWrapper(currentDeviceSettings)
  .withUseQueryWrapper(useCurrentDeviceSettings)

export const useValidatedCurrentLocation = new ValidatedClientBuilder(currentLocationResponse)
  .withFetchWrapper(currentLocation)
  .withUseQueryWrapper(useCurrentLocation)
