import { deviceDetails, deviceList, useDeviceDetails, useDeviceList } from './client'
import { ValidatedClientBuilder } from './validated-client-factory'
import { deviceDetailsResponse, deviceListResponse } from './zod'

export const useValidatedListDevices = new ValidatedClientBuilder(deviceListResponse)
  .fetchWrapperWithoutArgs(deviceList)
  .withQueryWrapper(useDeviceList)

export const useValidatedDeviceDetails = new ValidatedClientBuilder(deviceDetailsResponse)
  .fetchWrapperWithArg(deviceDetails)
  .withQueryWrapper(useDeviceDetails)
