import { useQuery } from '@tanstack/react-query'

import type { HealthResponse } from '@plusone/feeds/shared/types'

export function Health() {
  const { data, isLoading } = useQuery<HealthResponse>(
    ['health'],
    () => fetch('/api/health').then((res) => res.json()),
    { refetchInterval: 30_000 },
  )

  const status = isLoading ? 'loading...' : data?.status

  return <span>status: {status}</span>
}
