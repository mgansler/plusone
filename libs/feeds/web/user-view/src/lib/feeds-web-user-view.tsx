import { useFetchFeeds } from '@plusone/feeds/web/shared'
import { FeedsWebNewFeed } from '@plusone/feeds/web/new-feed'

import { ArticleList } from './article-list'

export function FeedsWebUserView() {
  const { data: feeds = [] } = useFetchFeeds()

  return (
    <div>
      <h1>Welcome to feeds-web-user-view!</h1>
      <FeedsWebNewFeed />
      {feeds.map((feed) => (
        <div key={feed.feedUrl}>
          {feed.title ?? feed.originalTitle}
          <ArticleList feedId={feed.id} />
        </div>
      ))}
    </div>
  )
}
