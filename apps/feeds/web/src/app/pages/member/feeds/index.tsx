import { useFeedControllerGetAll } from '@plusone/feeds/api-client'

import { Articles } from '../articles'

export function Feeds() {
  const { data } = useFeedControllerGetAll()

  return (
    <div>
      {data?.data.map((feedResponse) => (
        <section key={feedResponse.id} aria-label={feedResponse.title}>
          <h4>{feedResponse.title}</h4>
          <Articles feed={feedResponse} />
        </section>
      ))}
    </div>
  )
}
