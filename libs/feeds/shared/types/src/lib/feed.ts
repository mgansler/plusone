import type { Sort } from './enum/sort'

export type FeedInput = {
  url: string
  title?: string
  feedUrl: string
}

export type FeedResponse = {
  id: string
  originalTitle: string
  title?: string
  feedUrl: string
}

export type UserFeedResponse = FeedResponse & {
  includeRead: boolean
  order: Sort
  expandContent: boolean
  unreadCount: number
}
