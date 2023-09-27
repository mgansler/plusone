import {
  deviceDetails,
  deviceList,
  roomDetails,
  roomList,
  useDeviceDetails,
  useDeviceList,
  useRoomDetails,
  useRoomList,
} from './client'
import { ValidatedClientBuilder } from './validated-client-factory'
import { deviceDetailsResponse, deviceListResponse, roomDetailsResponse, roomListResponse } from './zod'

export const useValidatedListDevices = new ValidatedClientBuilder(deviceListResponse)
  .withFetchWrapper(deviceList)
  .withUseQueryWrapper(useDeviceList)

export const useValidatedDeviceDetails = new ValidatedClientBuilder(deviceDetailsResponse)
  .withFetchWrapper(deviceDetails)
  .withUseQueryWrapper(useDeviceDetails)

export const useValidatedListRooms = new ValidatedClientBuilder(roomListResponse)
  .withFetchWrapper(roomList)
  .withUseQueryWrapper(useRoomList)

export const useValidatedRoomDetails = new ValidatedClientBuilder(roomDetailsResponse)
  .withFetchWrapper(roomDetails)
  .withUseQueryWrapper(useRoomDetails)
