import { useInfiniteQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'
import { ArticleResponse, FeedResponse, Paginated } from '@plusone/feeds/shared/types'

export function useFetchArticlesByFeed(feedId: FeedResponse['id']) {
  const token = useToken()

  return useInfiniteQuery<Paginated<ArticleResponse>>(
    ['articles', feedId],
    ({ pageParam }) => {
      const pagination = new URLSearchParams({
        take: '10',
        skip: String(pageParam ?? 0),
      })
      return fetch(`/api/feed/${feedId}?${pagination}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(jsonOrThrow)
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const lastPageNumber = Math.floor(lastPage.totalCount / 10) * 10
        const nextPageNumber = allPages.length * 10
        return nextPageNumber > lastPageNumber ? undefined : nextPageNumber
      },
    },
  )
}
