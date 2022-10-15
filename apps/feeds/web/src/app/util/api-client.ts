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
    }).then(async (res) => {
      if (res.status >= 200 && res.status < 400) {
        return res.json()
      } else {
        let err: string
        try {
          const { message } = await res.json()
          err = message
        } catch (e) {
          err = `${res.status}: ${res.statusText}`
        }
        throw new Error(err)
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

export function useInfiniteQueryFn(url: string) {
  const { auth } = useUserContext()

  return ({ pageParam }: QueryFunctionContext) => {
    const fetchUrl = url + (pageParam !== undefined ? `?cursor=${pageParam}` : '')
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
