import { bootInfo, getFeedSettings, useBootInfo, useGetFeedSettings } from './client'
import { ValidatedClientBuilder } from './validated-client-factory'
import { bootInfoResponse, getFeedSettingsResponse } from './zod'

export const useValidatedBootInfo = new ValidatedClientBuilder(bootInfoResponse)
  .fetchWrapperWithoutArgs(bootInfo)
  .withQueryWrapper(useBootInfo)

export const useValidatedGetFeedSettings = new ValidatedClientBuilder(getFeedSettingsResponse)
  .fetchWrapperWithArgs(getFeedSettings)
  .withQueryWrapper(useGetFeedSettings)
