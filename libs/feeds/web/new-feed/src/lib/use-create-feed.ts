import { useMutation } from '@tanstack/react-query'

import type { FeedInput } from '@plusone/feeds/shared/types'
import { useToken } from '@plusone/feeds/web/login'
import { jsonOrThrow } from '@plusone/feeds/web/shared'

export function useCreateFeed() {
  const token = useToken()

  return useMutation<unknown, unknown, FeedInput>((variables) =>
    fetch('/api/feed', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
    }).then(jsonOrThrow),
  )
}
