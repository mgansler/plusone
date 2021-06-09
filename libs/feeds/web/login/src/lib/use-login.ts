import { useMutation } from 'react-query'

import { LoginProps } from './types'

export function useLogin(setToken: (newValue: string) => void) {
  return useMutation<{ access_token: string }, unknown, LoginProps>(
    (variables) =>
      fetch('/api/authentication/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      }).then((res) => {
        if (res.ok) return res.json()

        switch (res.status) {
          case 401:
            throw new Error(`Invalid credentials`)
          default:
            throw new Error(`${res.status}: ${res.statusText}`)
        }
      }),
    {
      onSuccess: ({ access_token }) => setToken(access_token),
    },
  )
}
