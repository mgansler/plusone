import type { ArticleResponseDto } from '@plusone/feeds/api-client'

import { Article } from './article'

type ArticleListProps = {
  articles: ArticleResponseDto[]
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <>
      {articles.map((article) => (
        <Article key={article.article.id} article={article} />
      ))}
    </>
  )
}
