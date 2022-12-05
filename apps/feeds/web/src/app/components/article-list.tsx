import { Stack } from '@mui/material'

import type { ArticleResponseDto } from '@plusone/feeds/api-client'

import { Article } from './article'

type ArticleListProps = {
  articles: ArticleResponseDto[]
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <Stack gap={1}>
      {articles.map((article) => (
        <Article key={article.article.id} article={article} />
      ))}
    </Stack>
  )
}
