import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { FeedResponse } from '@plusone/feeds/shared/types'

import { jsonOrThrow } from './json-or-throw'

export function useFetchFeeds() {
  const token = useToken()
  return useQuery<FeedResponse[]>('feeds', () =>
    fetch('/api/feed', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(jsonOrThrow),
  )
}
