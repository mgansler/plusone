import { useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'

import type { ArticleDto, ArticleResponseDto } from '@plusone/feeds/api-client'
import { getGetArticlesQueryKey, getSearchArticleQueryKey, useToggleUnread } from '@plusone/feeds/api-client'

function useToggleUnreadState(id: ArticleDto['id'], unread: boolean) {
  const { feedId } = useParams()
  const [searchParams] = useSearchParams()

  const queryClient = useQueryClient()
  const { mutate } = useToggleUnread({
    mutation: {
      onSuccess: async () => {
        const search = searchParams.get('search')
        if (search) {
          await queryClient.invalidateQueries(getSearchArticleQueryKey({ s: search }))
        }
        if (feedId) {
          await queryClient.invalidateQueries(getGetArticlesQueryKey(feedId))
        }
      },
    },
  })

  return (read?: boolean) => mutate({ id, data: { unread: typeof read !== 'undefined' ? !read : !unread } })
}

type ArticleProps = {
  article: ArticleResponseDto
}

export function Article({ article: { article, unread } }: ArticleProps) {
  const toggleUnread = useToggleUnreadState(article.id, unread)

  return (
    <article>
      <input type={'checkbox'} checked={!unread} onChange={() => toggleUnread()} />
      <a href={article.link} target={'_blank'} rel={'noreferrer'} onClick={() => toggleUnread(true)}>
        {article.title}
      </a>
    </article>
  )
}
