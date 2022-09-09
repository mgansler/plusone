import { useMutation } from '@tanstack/react-query'

import type { RegisterProps } from './types'

export function useRegister() {
  return useMutation<{ username: string }, unknown, RegisterProps>((variables) =>
    fetch('/api/authentication/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables),
    }).then((res) => {
      if (res.ok) return res.json()

      switch (res.status) {
        case 409:
          throw new Error(`User '${variables.username}' already exists`)
        default:
          throw new Error(`${res.status}: ${res.statusText}`)
      }
    }),
  )
}
