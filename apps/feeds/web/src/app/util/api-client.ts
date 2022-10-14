import { useUserContext } from '../context/user'

export function useMutationFn(url: string, init: RequestInit = {}) {
  const { auth } = useUserContext()

  return () =>
    fetch(url, {
      ...init,
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

export function useQueryFn(url: string) {
  const { auth } = useUserContext()

  return () =>
    fetch(url, {
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
