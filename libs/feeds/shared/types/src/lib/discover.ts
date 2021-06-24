import { Output } from 'rss-parser'

export interface DiscoverResponse {
  title: string
  feedUrl: string
}

export type DiscoverFeedResponse = Output<unknown>
export type DiscoverFeedRequest = string
