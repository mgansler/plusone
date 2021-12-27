import type { Output } from 'rss-parser'

export interface DiscoverResponse {
  url: string
  title: string
  feedUrl: string
}

export type DiscoverFeedResponse = Output<unknown>
export type DiscoverFeedRequest = string
