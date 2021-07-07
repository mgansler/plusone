export type FeedResponse = {
  id: string
  originalTitle: string
  title?: string
  feedUrl: string
}

export type FeedInput = {
  url: string
  title?: string
  feedUrl: string
}
