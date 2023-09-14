import { deviceList, useDeviceList } from './client'
import { ValidatedClientBuilder } from './validated-client-factory'
import { deviceListResponse } from './zod'

export const useValidatedListDevices = new ValidatedClientBuilder(deviceListResponse)
  .fetchWrapperWithoutArgs(deviceList)
  .withQueryWrapper(useDeviceList)
