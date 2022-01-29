import { useParams } from 'react-router-dom'
import { Link } from 'remix'

import type { FeedResponse } from '~/utils/types/feed'

export function FeedListItem(feed: FeedResponse) {
  const { id } = useParams<'id'>()

  const isActiveFeed = id === feed.id

  return (
    <li>
      <Link to={feed.id} className={`${isActiveFeed ? 'font-bold' : ''}`}>
        {feed.title ?? feed.originalTitle}
      </Link>
    </li>
  )
}
