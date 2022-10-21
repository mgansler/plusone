import { Fragment } from 'react'

import { useFeedControllerGetInfinite } from '@plusone/feeds/api-client'
import type { FeedResponse } from '@plusone/feeds/shared/types'

type ArticlesProps = {
  feed: FeedResponse
}

export function Articles({ feed }: ArticlesProps) {
  const { data, hasNextPage, fetchNextPage } = useFeedControllerGetInfinite(
    feed.id,
    {},
    {
      query: {
        getNextPageParam: (lastPage) => {
          return lastPage.data.content.length < lastPage.data.pageSize ? false : lastPage.data.lastCursor
        },
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
            {page.data.content.map((article) => (
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
