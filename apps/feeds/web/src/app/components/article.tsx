import { useQueryClient } from '@tanstack/react-query'

import type { ArticleDto, ArticleResponseDto } from '@plusone/feeds/api-client'
import { getFindArticlesQueryKey, useToggleUnread } from '@plusone/feeds/api-client'

function useToggleUnreadState(id: ArticleDto['id'], unread: boolean) {
  const queryClient = useQueryClient()
  const { mutate } = useToggleUnread({
    mutation: {
      onSuccess: async () => await queryClient.invalidateQueries(getFindArticlesQueryKey()),
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
      <div dangerouslySetInnerHTML={{ __html: article.contentBody }} />
    </article>
  )
}
