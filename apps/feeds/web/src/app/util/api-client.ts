import type { QueryFunctionContext } from '@tanstack/react-query'

import { AUTHENTICATION_LOCAL_STORAGE_KEY } from '../context/user'

export function getAuthorizationHeader(type: 'access_token' | 'refresh_token'): { Authorization: string } | undefined {
  const value = localStorage.getItem(AUTHENTICATION_LOCAL_STORAGE_KEY)

  if (value === null || typeof value === 'undefined' || value === 'undefined') {
    return undefined
  }

  const auth = JSON.parse(value)

  if (auth[type] === undefined) {
    return undefined
  }

  return { Authorization: `Bearer ${auth[type]}` }
}

export function useMutationFn(method: 'POST', url: string) {
  return (body: string | object) =>
    fetch(url, {
      method,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...getAuthorizationHeader('access_token'),
      },
    }).then(async (res) => {
      if (res.status === 401) {
        if (await refreshToken()) {
          return fetch(url, {
            method,
            body: typeof body === 'string' ? body : JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json',
              ...getAuthorizationHeader('access_token'),
            },
          }).then(parseOrThrow)
        }
      }
      return parseOrThrow(res)
    })
}

export function useQueryFn(url: string) {
  return (ctx: QueryFunctionContext) => {
    const fetchUrl = ctx.queryKey.length > 1 ? url + ctx.queryKey[1] : url
    return fetch(fetchUrl, {
      headers: getAuthorizationHeader('access_token'),
    }).then(async (res) => {
      if (res.status === 401) {
        if (await refreshToken()) {
          return fetch(fetchUrl, {
            headers: getAuthorizationHeader('access_token'),
          }).then(parseOrThrow)
        }
      }
      return parseOrThrow(res)
    })
  }
}

export function useInfiniteQueryFn(url: string) {
  return ({ pageParam }: QueryFunctionContext) => {
    const fetchUrl = url + (pageParam !== undefined ? `?cursor=${pageParam}` : '')
    return fetch(fetchUrl, {
      headers: getAuthorizationHeader('access_token'),
    }).then(async (res) => {
      if (res.status === 401) {
        if (await refreshToken()) {
          return fetch(fetchUrl, {
            headers: getAuthorizationHeader('access_token'),
          }).then(parseOrThrow)
        }
      }
      return parseOrThrow(res)
    })
  }
}

async function parseOrThrow(res: Response) {
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
}

async function refreshToken(): Promise<boolean> {
  const refreshTokens = await fetch('/api/authentication/refresh', {
    headers: getAuthorizationHeader('refresh_token'),
  }).then((res) => res.json())
  if (refreshTokens.access_token && refreshTokens.refresh_token) {
    localStorage.setItem(AUTHENTICATION_LOCAL_STORAGE_KEY, JSON.stringify(refreshTokens))
    return true
  }

  return false
}
