import { useGetHealthStatus } from '@plusone/feeds/api-client'

export function Health() {
  const { data, isLoading } = useGetHealthStatus({ query: { refetchInterval: 30_000 } })

  const status = isLoading ? 'loading...' : data?.status

  return <span>status: {status}</span>
}
