import { useQuery } from '@tanstack/react-query'

import type { FeedResponse } from '@plusone/feeds/shared/types'
import { useToken } from '@plusone/feeds/web/login'

import { jsonOrThrow } from './json-or-throw'

export function useFetchFeeds() {
  const token = useToken()
  return useQuery<FeedResponse[]>(['feeds'], () =>
    fetch('/api/feed', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(jsonOrThrow),
  )
}
