import { useInfiniteQuery } from 'react-query'

import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'
import { FeedResponse, PaginatedArticles } from '@plusone/feeds/shared/types'

export function useFetchArticlesByFeed(feedId: FeedResponse['id']) {
  const token = useToken()

  return useInfiniteQuery<PaginatedArticles>(
    ['articles', feedId],
    ({ pageParam }) => {
      const pagination = new URLSearchParams({
        cursor: pageParam ? String(pageParam) : '',
      })
      return fetch(`/api/feed/${feedId}?${pagination}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(jsonOrThrow)
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.pageSize > lastPage.content.length
          ? undefined
          : lastPage.content[lastPage.content.length - 1].cursor
      },
    },
  )
}
