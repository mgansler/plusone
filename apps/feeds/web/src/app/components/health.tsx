import { useHealthControllerGetHealthStatus } from '@plusone/feeds/api-client'

export function Health() {
  const { data, isLoading } = useHealthControllerGetHealthStatus({ query: { refetchInterval: 30_000 } })

  const status = isLoading ? 'loading...' : data?.data.status

  return <span>status: {status}</span>
}
