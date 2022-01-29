import invariant from '@remix-run/react/invariant'
import type { LoaderFunction } from 'remix'
import { useLoaderData } from 'remix'

import { fetchFeed } from '~/utils/api/feed'
import type { PaginatedArticles } from '~/utils/types/pagination'

type LoaderData = {
  paginatedArticles: PaginatedArticles
}

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.id)
  const paginatedArticles = await fetchFeed(request, params.id)

  return { paginatedArticles }
}

export default function () {
  const { paginatedArticles } = useLoaderData<LoaderData>()

  return (
    <div>
      <h2>Total Count: {paginatedArticles.totalCount}</h2>
    </div>
  )
}
