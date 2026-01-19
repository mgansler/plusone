import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import {
  useCurrentDeviceSettings,
  useCurrentLocation,
  useDeviceDetails,
  useDeviceList,
  useDiscoveredDevices,
  useGetCommand,
  useGetCommands,
} from './gen/client'
import {
  CurrentDeviceSettingsResponse,
  CurrentLocationResponse,
  DeviceDetailsResponse,
  DeviceListResponse,
  DiscoveredDevicesResponse,
  GetCommandResponse,
  GetCommandsResponse,
} from './gen/zod'

export const useValidatedDiscoveredDevicesList = buildValidatedUseQueryWrapper(
  useDiscoveredDevices,
  DiscoveredDevicesResponse,
)
export const useValidatedDeviceList = buildValidatedUseQueryWrapper(useDeviceList, DeviceListResponse)
export const useValidatedDeviceDetails = buildValidatedUseQueryWrapper(useDeviceDetails, DeviceDetailsResponse)

export const useValidatedDeviceSettings = buildValidatedUseQueryWrapper(
  useCurrentDeviceSettings,
  CurrentDeviceSettingsResponse,
)

export const useValidatedCurrentLocation = buildValidatedUseQueryWrapper(useCurrentLocation, CurrentLocationResponse)

export const useValidatedCommandsList = buildValidatedUseQueryWrapper(useGetCommands, GetCommandsResponse)

export const useValidatedGetCommand = buildValidatedUseQueryWrapper(useGetCommand, GetCommandResponse)
