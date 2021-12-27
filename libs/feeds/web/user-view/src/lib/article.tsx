import type { ArticleResponse, FeedResponse } from '@plusone/feeds/shared/types'

import { useToggleUnread } from './use-toggle-unread'

interface ArticleProps {
  feedId: FeedResponse['id']
  article: ArticleResponse['article']
  unread: ArticleResponse['unread']
  index: number
}

export function Article({ feedId, article, unread, index }: ArticleProps) {
  const { mutate } = useToggleUnread(feedId, article.id)

  return (
    <div key={article.id}>
      <button onClick={() => mutate({ unread: !unread })}>{unread ? 'mark as read' : 'mark as unread'}</button>
      {index + 1}. {article.title} -{' '}
    </div>
  )
}
