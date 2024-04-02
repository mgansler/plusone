import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import { useBootInfo, useGetFeedSettings } from './client'
import { bootInfoResponse, getFeedSettingsResponse } from './zod'

export const useValidatedBootInfo = buildValidatedUseQueryWrapper(useBootInfo, bootInfoResponse)

export const useValidatedGetFeedSettings = buildValidatedUseQueryWrapper(useGetFeedSettings, getFeedSettingsResponse)
