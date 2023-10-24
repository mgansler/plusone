import { bootInfo, getFeedSettings, useBootInfo, useGetFeedSettings } from './client'
import { ValidatedClientBuilder } from './validated-client-factory'
import { bootInfoResponse, getFeedSettingsResponse } from './zod'

export const useValidatedBootInfo = new ValidatedClientBuilder(bootInfoResponse)
  .withFetchWrapper(bootInfo)
  .withUseQueryWrapper(useBootInfo)

export const useValidatedGetFeedSettings = new ValidatedClientBuilder(getFeedSettingsResponse)
  .withFetchWrapper(getFeedSettings)
  .withUseQueryWrapper(useGetFeedSettings)
