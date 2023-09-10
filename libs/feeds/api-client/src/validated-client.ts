import { bootInfo, getFeedSettings, useBootInfo, useGetFeedSettings } from './client'
import { ValidatedClientBuilder } from './validated-client-factory'
import { bootInfoResponse, getFeedSettingsResponse } from './zod'

export const useValidatedBootInfo = new ValidatedClientBuilder(bootInfoResponse)
  .wrapperWithoutArgs(bootInfo)
  .build(useBootInfo)

export const useValidatedGetFeedSettings = new ValidatedClientBuilder(getFeedSettingsResponse)
  .wrapperWithArgs(getFeedSettings)
  .build(useGetFeedSettings)
