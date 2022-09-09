import type { InfiniteData } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'
import type { ArticleResponse, FeedResponse, PaginatedArticles, ToggleUnreadRequest } from '@plusone/feeds/shared/types'

export function useToggleUnread(feedId: FeedResponse['id'], articleId: ArticleResponse['article']['id']) {
  const token = useToken()
  const queryClient = useQueryClient()

  return useMutation(
    ['articles', feedId],
    (variables: ToggleUnreadRequest) =>
      fetch(`/api/article/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(variables),
      }).then(jsonOrThrow),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['articles', feedId], (input) => {
          for (const page of (input as InfiniteData<PaginatedArticles>).pages) {
            for (const articleResponse of page.content) {
              if (articleResponse.article.id === articleId) {
                articleResponse.unread = data.unread
              }
            }
          }

          return input
        })
      },
    },
  )
}
