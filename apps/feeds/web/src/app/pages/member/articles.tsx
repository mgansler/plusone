import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment } from 'react'

import type { FeedResponse, PaginatedArticles } from '@plusone/feeds/shared/types'

import { useInfiniteQueryFn } from '../../util/api-client'

type ArticlesProps = {
  feed: FeedResponse
}

export function Articles({ feed }: ArticlesProps) {
  const fetchArticlesQueryFn = useInfiniteQueryFn(`/api/feed/${feed.id}`)
  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery<PaginatedArticles>(
    ['feed', feed.id],
    fetchArticlesQueryFn,
    {
      getNextPageParam: (lastPage) => {
        return lastPage.content.length < lastPage.pageSize ? false : lastPage.lastCursor
      },
    },
  )

  if (!data) {
    return null
  }

  return (
    <>
      {data.pages.map((page, index) => {
        return (
          <Fragment key={index}>
            {page.content.map((article) => (
              <article key={article.article.id}>{article.article.title}</article>
            ))}
          </Fragment>
        )
      })}
      <button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        next
      </button>
    </>
  )
}
