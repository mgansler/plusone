import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import {
  useCurrentDeviceSettings,
  useCurrentLocation,
  useDeviceDetails,
  useDeviceList,
  useDiscoveredDevices,
  useGetCommands,
} from './gen/client'
import {
  currentDeviceSettingsResponse,
  currentLocationResponse,
  deviceDetailsResponse,
  deviceListResponse,
  discoveredDevicesResponse,
  getCommandsResponse,
} from './gen/zod'

export const useValidatedDiscoveredDevicesList = buildValidatedUseQueryWrapper(
  useDiscoveredDevices,
  discoveredDevicesResponse,
)
export const useValidatedDeviceList = buildValidatedUseQueryWrapper(useDeviceList, deviceListResponse)
export const useValidatedDeviceDetails = buildValidatedUseQueryWrapper(useDeviceDetails, deviceDetailsResponse)

export const useValidatedDeviceSettings = buildValidatedUseQueryWrapper(
  useCurrentDeviceSettings,
  currentDeviceSettingsResponse,
)

export const useValidatedCurrentLocation = buildValidatedUseQueryWrapper(useCurrentLocation, currentLocationResponse)

export const useValidatedCommandsList = buildValidatedUseQueryWrapper(useGetCommands, getCommandsResponse)
