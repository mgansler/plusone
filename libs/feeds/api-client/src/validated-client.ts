import { buildValidatedUseQueryWrapper } from '@plusone/validated-query-factory'

import {
  useBootInfo,
  useFindArticlesInfinite,
  useGetAdminStats,
  useGetFeedSettings,
  useGetFeedTags,
  useGetHealthStatus,
  useGetTags,
  useGetUserFeeds,
  useGetUsers,
  useRecentlyReadArticles,
} from './gen/client'
import {
  bootInfoResponse,
  findArticlesResponse,
  getAdminStatsResponse,
  getFeedSettingsResponse,
  getFeedTagsResponse,
  getHealthStatusResponse,
  getTagsResponse,
  getUserFeedsResponse,
  getUsersResponse,
  recentlyReadArticlesResponse,
} from './gen/zod'

export const useValidatedBootInfo = buildValidatedUseQueryWrapper(useBootInfo, bootInfoResponse)
export const useValidatedGetAdminStats = buildValidatedUseQueryWrapper(useGetAdminStats, getAdminStatsResponse)
export const useValidatedGetFeedSettings = buildValidatedUseQueryWrapper(useGetFeedSettings, getFeedSettingsResponse)
export const useValidatedGetFeedTags = buildValidatedUseQueryWrapper(useGetFeedTags, getFeedTagsResponse)
export const useValidatedGetHealthStatus = buildValidatedUseQueryWrapper(useGetHealthStatus, getHealthStatusResponse)
export const useValidatedGetTags = buildValidatedUseQueryWrapper(useGetTags, getTagsResponse)
export const useValidatedGetUsers = buildValidatedUseQueryWrapper(useGetUsers, getUsersResponse)
export const useValidatedFindArticlesInfinite = buildValidatedUseQueryWrapper(
  useFindArticlesInfinite,
  findArticlesResponse,
)
export const useValidatedGetUserFeeds = buildValidatedUseQueryWrapper(useGetUserFeeds, getUserFeedsResponse)
export const useValidatedRecentlyReadArticles = buildValidatedUseQueryWrapper(
  useRecentlyReadArticles,
  recentlyReadArticlesResponse,
)
