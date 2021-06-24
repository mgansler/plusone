import { Feed } from '@plusone/feeds/web/shared'

import { useFetchArticlesByFeed } from './use-fetch-articles-by-feed'

interface ArticleListProps {
  feedId: Feed['id']
}

export function ArticleList({ feedId }: ArticleListProps) {
  const { data: articles = [] } = useFetchArticlesByFeed(feedId)

  return (
    <div>
      {articles.map(({ article, unread }) => (
        <div key={article.id}>
          {article.title} - {unread ? 'unread' : 'read'}
        </div>
      ))}
    </div>
  )
}
