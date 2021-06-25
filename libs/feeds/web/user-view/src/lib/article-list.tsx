import { FeedResponse } from '@plusone/feeds/shared/types'

import { useFetchArticlesByFeed } from './use-fetch-articles-by-feed'
import { Article } from './article'

interface ArticleListProps {
  feedId: FeedResponse['id']
}

export function ArticleList({ feedId }: ArticleListProps) {
  const { data = { pages: [] }, fetchNextPage, hasNextPage } = useFetchArticlesByFeed(feedId)

  const articles = []
  for (const page of data.pages) {
    articles.push(...page.content)
  }

  return (
    <div>
      {articles.map(({ article, unread }, index) => (
        <Article key={article.id} article={article} unread={unread} index={index} feedId={feedId} />
      ))}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
        load more...
      </button>
    </div>
  )
}
