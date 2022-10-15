import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

import type { FeedResponse } from '@plusone/feeds/shared/types'

import { useQueryFn } from '../../util/api-client'

import { Articles } from './articles'
import { NewFeed, NewFeedFallback } from './new-feed'

export function Member() {
  const fetchFeedListQueryFn = useQueryFn('/api/feed/')
  const { data, refetch: reloadFeeds } = useQuery<FeedResponse[]>(['feeds'], fetchFeedListQueryFn)

  return (
    <div>
      Feeds
      <ErrorBoundary FallbackComponent={NewFeedFallback}>
        <NewFeed reloadFeeds={reloadFeeds} />
      </ErrorBoundary>
      <div>
        {data?.map((feedResponse) => (
          <section key={feedResponse.id} aria-label={feedResponse.title}>
            <h4>{feedResponse.title}</h4>
            <Articles feed={feedResponse} />
          </section>
        ))}
      </div>
    </div>
  )
}
