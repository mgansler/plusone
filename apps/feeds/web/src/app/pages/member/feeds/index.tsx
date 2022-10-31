import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import type { UserFeedResponseDto } from '@plusone/feeds/api-client'
import { useGetUserFeeds } from '@plusone/feeds/api-client'
import { Sort } from '@plusone/feeds/shared/types'

import { useArticleFindContext } from '../../../context/article-find'

type FeedEntryProps = {
  feed: UserFeedResponseDto
}

function FeedEntry({ feed }: FeedEntryProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort } = useArticleFindContext()

  const handleGoToFeed = () => {
    setSort(feed.order === 'desc' ? Sort.NewestFirst : Sort.OldestFirst)
    setIncludeRead(feed.includeRead)
    navigate({ pathname: feed.id, search: searchParams.toString() })
  }

  return (
    <section aria-label={feed.title}>
      <h4 onClick={handleGoToFeed}>{feed.title}</h4>
    </section>
  )
}

export function FeedList() {
  const navigate = useNavigate()
  const { data } = useGetUserFeeds()
  const [searchParams] = useSearchParams()
  const { setIncludeRead, setSort } = useArticleFindContext()

  const goToAll = () => {
    setSort(Sort.NewestFirst)
    setIncludeRead(false)
    navigate({ pathname: 'all', search: searchParams.toString() })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
      <div>
        <section aria-label={'all feeds'}>
          <h4 onClick={goToAll}>All</h4>
        </section>
        {data?.data.map((feed) => (
          <FeedEntry key={feed.id} feed={feed} />
        ))}
      </div>
      <Outlet />
    </div>
  )
}
