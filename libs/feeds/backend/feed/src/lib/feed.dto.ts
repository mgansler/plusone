export class FeedDiscoverDto {
  url: string
}

export class FeedInputDto extends FeedDiscoverDto {
  title: string
  feedUrl: string
}
