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
  useProfile,
  useRecentlyReadArticles,
} from './gen/client'
import {
  BootInfoResponse,
  FindArticlesResponse,
  GetAdminStatsResponse,
  GetFeedSettingsResponse,
  GetFeedTagsResponse,
  GetHealthStatusResponse,
  GetTagsResponse,
  GetUserFeedsResponse,
  GetUsersResponse,
  ProfileResponse,
  RecentlyReadArticlesResponse,
} from './gen/zod'

export const useValidatedBootInfo = buildValidatedUseQueryWrapper(useBootInfo, BootInfoResponse)
export const useValidatedGetAdminStats = buildValidatedUseQueryWrapper(useGetAdminStats, GetAdminStatsResponse)
export const useValidatedGetFeedSettings = buildValidatedUseQueryWrapper(useGetFeedSettings, GetFeedSettingsResponse)
export const useValidatedGetFeedTags = buildValidatedUseQueryWrapper(useGetFeedTags, GetFeedTagsResponse)
export const useValidatedGetHealthStatus = buildValidatedUseQueryWrapper(useGetHealthStatus, GetHealthStatusResponse)
export const useValidatedGetTags = buildValidatedUseQueryWrapper(useGetTags, GetTagsResponse)
export const useValidatedGetUsers = buildValidatedUseQueryWrapper(useGetUsers, GetUsersResponse)
export const useValidatedFindArticlesInfinite = buildValidatedUseQueryWrapper(
  useFindArticlesInfinite,
  FindArticlesResponse,
)
export const useValidatedGetUserFeeds = buildValidatedUseQueryWrapper(useGetUserFeeds, GetUserFeedsResponse)
export const useValidatedRecentlyReadArticles = buildValidatedUseQueryWrapper(
  useRecentlyReadArticles,
  RecentlyReadArticlesResponse,
)
export const useValidatedProfile = buildValidatedUseQueryWrapper(useProfile, ProfileResponse)
