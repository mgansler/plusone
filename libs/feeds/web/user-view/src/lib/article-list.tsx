import { useEffect, useState } from 'react'
import { uniqBy } from 'lodash'

import { FeedResponse } from '@plusone/feeds/shared/types'

import { useFetchArticlesByFeed } from './use-fetch-articles-by-feed'

interface ArticleListProps {
  feedId: FeedResponse['id']
}

export function ArticleList({ feedId }: ArticleListProps) {
  const [skip, setSkip] = useState<number>(0)
  const { data = { content: [], totalCount: 0 } } = useFetchArticlesByFeed(feedId, skip)
  const [articles, setArticles] = useState(data.content)
  useEffect(() => {
    setArticles((prevState) => uniqBy([...prevState, ...data.content], 'article.id'))
  }, [data.content])

  return (
    <div>
      {articles.map(({ article, unread }, index) => (
        <div key={article.id}>
          {index + 1}. {article.title} - {unread ? 'unread' : 'read'}
        </div>
      ))}
      <button onClick={() => setSkip((prevState) => prevState + 10)} disabled={skip + 10 >= data.totalCount}>
        load more...
      </button>
    </div>
  )
}
