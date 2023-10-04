import {
  deviceDetails,
  deviceList,
  groupDetails,
  groupList,
  useDeviceDetails,
  useDeviceList,
  useGroupDetails,
  useGroupList,
} from './client'
import { ValidatedClientBuilder } from './validated-client-factory'
import { deviceDetailsResponse, deviceListResponse, groupDetailsResponse, groupListResponse } from './zod'

export const useValidatedListDevices = new ValidatedClientBuilder(deviceListResponse)
  .withFetchWrapper(deviceList)
  .withUseQueryWrapper(useDeviceList)

export const useValidatedDeviceDetails = new ValidatedClientBuilder(deviceDetailsResponse)
  .withFetchWrapper(deviceDetails)
  .withUseQueryWrapper(useDeviceDetails)

export const useValidatedListGroups = new ValidatedClientBuilder(groupListResponse)
  .withFetchWrapper(groupList)
  .withUseQueryWrapper(useGroupList)

export const useValidatedGroupDetails = new ValidatedClientBuilder(groupDetailsResponse)
  .withFetchWrapper(groupDetails)
  .withUseQueryWrapper(useGroupDetails)
