/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * Feeds API
 * OpenAPI spec version: 0.1
 */
import { z as zod } from 'zod'

export const markArticlesReadQueryParams = zod
  .object({
    s: zod.string().optional(),
    f: zod.string().optional(),
  })
  .strict()

export const toggleUnreadParams = zod
  .object({
    articleId: zod.string(),
  })
  .strict()

export const toggleUnreadBody = zod
  .object({
    unread: zod.boolean(),
  })
  .strict()

export const toggleUnreadResponse = zod
  .object({
    article: zod
      .object({
        content: zod.string().nullable(),
        date: zod.string().datetime(),
        guid: zod.string(),
        id: zod.string(),
        link: zod.string().nullable(),
        title: zod.string().nullable(),
      })
      .strict(),
    cursor: zod.number(),
    starred: zod.boolean(),
    unread: zod.boolean(),
  })
  .strict()

export const starArticleParams = zod
  .object({
    articleId: zod.string(),
  })
  .strict()

export const starArticleBody = zod
  .object({
    starred: zod.boolean(),
  })
  .strict()

export const findArticlesQueryParams = zod
  .object({
    s: zod.string().optional(),
    starred: zod.boolean().optional(),
    r: zod.boolean().optional(),
    sort: zod.enum(['desc', 'asc']).optional(),
    f: zod.string().optional(),
    cursor: zod.number().optional(),
  })
  .strict()

export const findArticlesResponse = zod
  .object({
    content: zod.array(
      zod
        .object({
          article: zod
            .object({
              content: zod.string().nullable(),
              date: zod.string().datetime(),
              guid: zod.string(),
              id: zod.string(),
              link: zod.string().nullable(),
              title: zod.string().nullable(),
            })
            .strict(),
          cursor: zod.number(),
          starred: zod.boolean(),
          unread: zod.boolean(),
        })
        .strict(),
    ),
    pageSize: zod.number(),
    totalCount: zod.number(),
    unreadCount: zod.number(),
    lastCursor: zod.number().optional(),
  })
  .strict()

export const recentlyReadArticlesResponseItem = zod
  .object({
    article: zod
      .object({
        content: zod.string().nullable(),
        date: zod.string().datetime(),
        guid: zod.string(),
        id: zod.string(),
        link: zod.string().nullable(),
        title: zod.string().nullable(),
      })
      .strict(),
    cursor: zod.number(),
    starred: zod.boolean(),
    unread: zod.boolean(),
  })
  .strict()
export const recentlyReadArticlesResponse = zod.array(recentlyReadArticlesResponseItem)

export const loginBody = zod
  .object({
    username: zod.string(),
    password: zod.string(),
  })
  .strict()

export const registerBody = zod
  .object({
    username: zod.string(),
    password: zod.string(),
  })
  .strict()

export const profileResponse = zod
  .object({
    email: zod.string().optional(),
    id: zod.string(),
    isAdmin: zod.boolean(),
    username: zod.string(),
  })
  .strict()

export const refreshResponse = zod
  .object({
    access_token: zod.string(),
    refresh_token: zod.string(),
  })
  .strict()

export const bootInfoResponseAppVersionRegExp = new RegExp('^\\d\\.\\d+$')

export const bootInfoResponse = zod
  .object({
    appVersion: zod.string().regex(bootInfoResponseAppVersionRegExp),
    pageSize: zod.number(),
  })
  .strict()

export const discoverFeedQueryParams = zod
  .object({
    url: zod.string(),
  })
  .strict()

export const discoverFeedResponse = zod
  .object({
    feedUrl: zod.string().nullable(),
    title: zod.string().nullable(),
    url: zod.string(),
  })
  .strict()

export const addFeedBody = zod
  .object({
    url: zod.string().optional(),
    title: zod.string(),
    feedUrl: zod.string(),
  })
  .strict()

export const getUserFeedsResponseItem = zod
  .object({
    feedUrl: zod.string(),
    id: zod.string(),
    feedId: zod.string(),
    originalTitle: zod.string(),
    title: zod.string().optional(),
    includeRead: zod.boolean(),
    order: zod.enum(['desc', 'asc']),
    expandContent: zod.boolean(),
    unreadCount: zod.number(),
    tags: zod.array(
      zod
        .object({
          id: zod.string(),
          name: zod.string(),
        })
        .strict(),
    ),
  })
  .strict()
export const getUserFeedsResponse = zod.array(getUserFeedsResponseItem)

export const importFeedsBodyItem = zod
  .object({
    url: zod.string().optional(),
    title: zod.string(),
    feedUrl: zod.string(),
  })
  .strict()
export const importFeedsBody = zod.array(importFeedsBodyItem)

export const getFeedsResponseItem = zod
  .object({
    feedUrl: zod.string(),
    id: zod.string(),
    originalTitle: zod.string(),
    title: zod.string().optional(),
  })
  .strict()
export const getFeedsResponse = zod.array(getFeedsResponseItem)

export const getFeedSettingsParams = zod
  .object({
    id: zod.string(),
  })
  .strict()

export const getFeedSettingsResponse = zod
  .object({
    id: zod.string(),
    title: zod.string(),
    expandContent: zod.boolean(),
    includeRead: zod.boolean(),
    order: zod.enum(['desc', 'asc']),
  })
  .strict()

export const updateFeedSettingsParams = zod
  .object({
    id: zod.string(),
  })
  .strict()

export const updateFeedSettingsBody = zod
  .object({
    expandContent: zod.boolean(),
    includeRead: zod.boolean(),
    order: zod.enum(['desc', 'asc']),
    title: zod.string().optional(),
  })
  .strict()

export const getFeedTagsParams = zod
  .object({
    id: zod.string(),
  })
  .strict()

export const getFeedTagsResponseItem = zod
  .object({
    id: zod.string(),
    name: zod.string(),
  })
  .strict()
export const getFeedTagsResponse = zod.array(getFeedTagsResponseItem)

export const tagFeedParams = zod
  .object({
    id: zod.string(),
  })
  .strict()

export const tagFeedBody = zod
  .object({
    tagId: zod.string(),
  })
  .strict()

export const untagFeedParams = zod
  .object({
    id: zod.string(),
  })
  .strict()

export const untagFeedBody = zod
  .object({
    tagId: zod.string(),
  })
  .strict()

export const getTagsResponseItem = zod
  .object({
    id: zod.string(),
    name: zod.string(),
  })
  .strict()
export const getTagsResponse = zod.array(getTagsResponseItem)

export const addTagBody = zod
  .object({
    name: zod.string(),
  })
  .strict()

export const removeTagParams = zod
  .object({
    id: zod.string(),
  })
  .strict()

export const healthControllerGetHealthStatusResponse = zod
  .object({
    status: zod.string().optional(),
    info: zod
      .record(
        zod.string(),
        zod
          .object({
            status: zod.string(),
          })
          .strict(),
      )
      .nullish(),
    error: zod
      .record(
        zod.string(),
        zod
          .object({
            status: zod.string(),
          })
          .strict(),
      )
      .nullish(),
    details: zod
      .record(
        zod.string(),
        zod
          .object({
            status: zod.string(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict()

export const getUsersResponseItem = zod
  .object({
    email: zod.string().optional(),
    id: zod.string(),
    isAdmin: zod.boolean(),
    username: zod.string(),
  })
  .strict()
export const getUsersResponse = zod.array(getUsersResponseItem)

export const deleteUserParams = zod
  .object({
    userId: zod.any(),
  })
  .strict()
