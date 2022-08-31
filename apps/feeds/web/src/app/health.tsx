import { useQuery } from '@tanstack/react-query'

type HealthResponse = {
  status: string
  info: object
  error: object
  details: object
}

export function Health() {
  const { data, isLoading } = useQuery<HealthResponse>(['health'], () => fetch('/api/health').then((res) => res.json()))

  const status = isLoading ? 'loading...' : data?.status

  return <span>status: {status}</span>
}
