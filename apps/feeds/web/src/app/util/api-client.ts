import type { QueryFunctionContext } from '@tanstack/react-query'

import { useUserContext } from '../context/user'

export function useMutationFn(method: 'POST', url: string) {
  const { auth } = useUserContext()

  return (body: string | object) =>
    fetch(url, {
      method,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth?.access_token}`,
      },
    }).then((res) => {
      if (res.status >= 200 && res.status < 400) {
        return res.json()
      } else {
        throw new Error(res.statusText)
      }
    })
}

export function useQueryFn(url: string) {
  const { auth } = useUserContext()

  return (ctx: QueryFunctionContext) => {
    const fetchUrl = ctx.queryKey.length > 1 ? url + ctx.queryKey[1] : url
    return fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${auth?.access_token}`,
      },
    }).then((res) => {
      if (res.status >= 200 && res.status < 400) {
        return res.json()
      } else {
        throw new Error(res.statusText)
      }
    })
  }
}
