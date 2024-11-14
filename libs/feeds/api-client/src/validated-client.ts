import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import { useBootInfo, useGetFeedSettings } from './gen/client'
import { bootInfoResponse, getFeedSettingsResponse } from './gen/zod'

export const useValidatedBootInfo = buildValidatedUseQueryWrapper(useBootInfo, bootInfoResponse)

export const useValidatedGetFeedSettings = buildValidatedUseQueryWrapper(useGetFeedSettings, getFeedSettingsResponse)
