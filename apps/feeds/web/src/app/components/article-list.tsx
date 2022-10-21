import type { ArticleResponseDto } from '@plusone/feeds/api-client'

type ArticleListProps = {
  articles: ArticleResponseDto[]
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <>
      {articles.map((article) => (
        <article key={article.article.id}>{article.article.title}</article>
      ))}
    </>
  )
}
