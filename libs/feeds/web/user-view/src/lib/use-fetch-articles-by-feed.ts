import { useQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'
import { ArticleResponse, FeedResponse, Paginated } from '@plusone/feeds/shared/types'

export function useFetchArticlesByFeed(feedId: FeedResponse['id'], skip: number) {
  const token = useToken()

  const pagination = new URLSearchParams({
    take: '10',
    skip: String(skip),
  })

  return useQuery<Paginated<ArticleResponse>>(
    ['articles', feedId, skip],
    () =>
      fetch(`/api/feed/${feedId}?${pagination}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(jsonOrThrow),
    { keepPreviousData: true },
  )
}
