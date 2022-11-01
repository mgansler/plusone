import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import type { UserFeedResponseDto } from '@plusone/feeds/api-client'
import { useGetUserFeeds } from '@plusone/feeds/api-client'
import { Sort } from '@plusone/feeds/shared/types'

import { useFeedSettingsContext } from '../../../context/feed-settings'

type FeedEntryProps = {
  feed: UserFeedResponseDto
}

function FeedEntry({ feed }: FeedEntryProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort, setExpandContent } = useFeedSettingsContext()

  const handleGoToFeed = () => {
    setSort(feed.order === 'desc' ? Sort.NewestFirst : Sort.OldestFirst)
    setIncludeRead(feed.includeRead)
    setExpandContent(feed.expandContent)
    navigate({ pathname: feed.id, search: searchParams.toString() })
  }

  return (
    <section aria-label={feed.title}>
      <h4 onClick={handleGoToFeed}>
        {feed.title} ({feed.unreadCount})
      </h4>
    </section>
  )
}

export function FeedList() {
  const navigate = useNavigate()
  const { data } = useGetUserFeeds()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort } = useFeedSettingsContext()

  const goToAll = () => {
    setSort(Sort.NewestFirst)
    setIncludeRead(false)
    navigate({ pathname: 'all', search: searchParams.toString() })
  }

  const totalUnreadCount = data?.data.reduce((total, feed) => total + feed.unreadCount, 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
      <div>
        <button onClick={() => navigate('../new')}>add feed</button>

        <section aria-label={'all feeds'}>
          <h4 onClick={goToAll}>All ({totalUnreadCount})</h4>
        </section>

        {data?.data.map((feed) => (
          <FeedEntry key={feed.id} feed={feed} />
        ))}
      </div>
      <Outlet />
    </div>
  )
}
