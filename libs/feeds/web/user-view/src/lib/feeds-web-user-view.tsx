import { useFetchFeeds } from '@plusone/feeds/web/shared'

export function FeedsWebUserView() {
  const { data: feeds = [] } = useFetchFeeds()

  return (
    <div>
      <h1>Welcome to feeds-web-user-view!</h1>
      {feeds.map((feed) => (
        <div key={feed.feedUrl}>{feed.title ?? feed.originalTitle}</div>
      ))}
    </div>
  )
}
