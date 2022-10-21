import { ErrorBoundary } from 'react-error-boundary'

import { useFeedControllerGetAll } from '@plusone/feeds/api-client'

import { Articles } from './articles'
import { NewFeed, NewFeedFallback } from './new-feed'

export function Member() {
  const { data, refetch: reloadFeeds } = useFeedControllerGetAll()

  return (
    <div>
      Feeds
      <ErrorBoundary FallbackComponent={NewFeedFallback}>
        <NewFeed reloadFeeds={reloadFeeds} />
      </ErrorBoundary>
      <div>
        {data?.data.map((feedResponse) => (
          <section key={feedResponse.id} aria-label={feedResponse.title}>
            <h4>{feedResponse.title}</h4>
            <Articles feed={feedResponse} />
          </section>
        ))}
      </div>
    </div>
  )
}
