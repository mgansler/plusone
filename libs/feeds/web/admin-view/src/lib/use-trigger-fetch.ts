import { useToken } from '@plusone/feeds/web/login'

export function useTriggerFetch() {
  const token = useToken()

  return () =>
    fetch('/api/schedule/now', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
}
