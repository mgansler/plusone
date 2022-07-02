import type { LoaderFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'

import { FeedListItem } from '~/components/feed-list-item'
import { fetchFeeds } from '~/utils/api/feed'
import type { User } from '~/utils/session.server'
import { requireUser } from '~/utils/session.server'
import type { FeedResponse } from '~/utils/types/feed'

type LoaderData = {
  user: User
  feeds: FeedResponse[]
}

export const loader: LoaderFunction = async ({ request }): Promise<LoaderData> => {
  const user = await requireUser(request)
  const feeds = await fetchFeeds(request)

  return { user, feeds }
}

export default function () {
  const data = useLoaderData<LoaderData>()

  return (
    <div>
      <h1>User View</h1>
      <p>Welcome {data.user.username}!</p>

      <form method={'post'} action={'/logout'}>
        <button type={'submit'}>Logout {data.user.username}</button>
      </form>

      <Link to={'new'}>new</Link>

      <ul>
        {data.feeds.map((feed) => (
          <FeedListItem key={feed.id} {...feed} />
        ))}
      </ul>

      <Outlet />
    </div>
  )
}
