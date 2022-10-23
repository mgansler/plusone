import { Link, useSearchParams } from 'react-router-dom'

import { useSearchArticleInfinite } from '@plusone/feeds/api-client'

import { ArticleList } from '../../../components/article-list'

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search')

  const { data, hasNextPage, fetchNextPage } = useSearchArticleInfinite(
    { s: search },
    {
      query: {
        getNextPageParam: (lastPage) =>
          lastPage.data.content.length < lastPage.data.pageSize ? false : lastPage.data.lastCursor,
      },
    },
  )

  if (!data) {
    return null
  }

  return (
    <>
      <Link to={'../feeds'} onClick={() => setSearchParams()}>
        back
      </Link>
      {data.pages.map((page, index) => (
        <ArticleList key={index} articles={page.data.content} />
      ))}
      <button disabled={!hasNextPage} onClick={() => fetchNextPage()}>
        next
      </button>
    </>
  )
}
