import { ValidatedClientBuilder } from '@plusone/validated-query-factory'

import {
  currentDeviceSettings,
  deviceDetails,
  deviceList,
  groupDetails,
  groupList,
  useCurrentDeviceSettings,
  useDeviceDetails,
  useDeviceList,
  useGroupDetails,
  useGroupList,
} from './client'
import {
  currentDeviceSettingsResponse,
  deviceDetailsResponse,
  deviceListResponse,
  groupDetailsResponse,
  groupListResponse,
} from './zod'

export const useValidatedDeviceList = new ValidatedClientBuilder(deviceListResponse)
  .withFetchWrapper(deviceList)
  .withUseQueryWrapper(useDeviceList)

export const useValidatedDeviceDetails = new ValidatedClientBuilder(deviceDetailsResponse)
  .withFetchWrapper(deviceDetails)
  .withUseQueryWrapper(useDeviceDetails)

export const useValidatedDeviceSettings = new ValidatedClientBuilder(currentDeviceSettingsResponse)
  .withFetchWrapper(currentDeviceSettings)
  .withUseQueryWrapper(useCurrentDeviceSettings)

export const useValidatedGroupList = new ValidatedClientBuilder(groupListResponse)
  .withFetchWrapper(groupList)
  .withUseQueryWrapper(useGroupList)

export const useValidatedGroupDetails = new ValidatedClientBuilder(groupDetailsResponse)
  .withFetchWrapper(groupDetails)
  .withUseQueryWrapper(useGroupDetails)
