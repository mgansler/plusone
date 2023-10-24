import { ValidatedClientBuilder } from '@plusone/validated-query-factory'

import { bootInfo, getFeedSettings, useBootInfo, useGetFeedSettings } from './client'
import { bootInfoResponse, getFeedSettingsResponse } from './zod'

export const useValidatedBootInfo = new ValidatedClientBuilder(bootInfoResponse)
  .withFetchWrapper(bootInfo)
  .withUseQueryWrapper(useBootInfo)

export const useValidatedGetFeedSettings = new ValidatedClientBuilder(getFeedSettingsResponse)
  .withFetchWrapper(getFeedSettings)
  .withUseQueryWrapper(useGetFeedSettings)
