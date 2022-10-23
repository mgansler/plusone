import { Outlet, useNavigate } from 'react-router-dom'

import { useGetFeeds } from '@plusone/feeds/api-client'

export function FeedList() {
  const navigate = useNavigate()
  const { data } = useGetFeeds()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
      <div>
        {data?.data.map((feedResponse) => (
          <section key={feedResponse.id} aria-label={feedResponse.title}>
            <h4 onClick={() => navigate(feedResponse.id)}>{feedResponse.title}</h4>
          </section>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
