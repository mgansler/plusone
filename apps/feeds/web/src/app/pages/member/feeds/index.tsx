import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'

import { useGetFeeds } from '@plusone/feeds/api-client'

export function FeedList() {
  const navigate = useNavigate()
  const { data } = useGetFeeds()
  const [searchParams] = useSearchParams()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
      <div>
        <section aria-label={'all feeds'}>
          <h4 onClick={() => navigate({ pathname: 'all', search: searchParams.toString() })}>All</h4>
        </section>
        {data?.data.map((feedResponse) => (
          <section key={feedResponse.id} aria-label={feedResponse.title}>
            <h4
              onClick={() =>
                navigate({
                  pathname: feedResponse.id,
                  search: searchParams.toString(),
                })
              }
            >
              {feedResponse.title}
            </h4>
          </section>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
