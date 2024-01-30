import type { Output } from 'rss-parser'

export type DiscoverResponse = {
  url: string
  title: string
  feedUrl: string
}

export type DiscoverFeedResponse = Output<unknown>
export type DiscoverFeedRequest = string
