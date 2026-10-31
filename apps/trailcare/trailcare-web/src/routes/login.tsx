import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import type { FormEvent } from 'react'
import { useState } from 'react'

import { getGetSessionQueryKey, useLogin } from '@plusone/trailcare-api-client'

import { Blaze } from '../components/blaze'
import { errorMessage } from '../lib/api-error'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const queryClient = useQueryClient()
  const [password, setPassword] = useState('')
  const { mutate, isPending, error } = useLogin({
    mutation: { onSuccess: (session) => queryClient.setQueryData(getGetSessionQueryKey(), session) },
  })

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutate({ data: { password } })
  }

  const message = error ? loginErrorMessage(error) : undefined

  return (
    <main className="login">
      <form className="login-form" onSubmit={onSubmit}>
        <div className="login-mark">
          <Blaze status="GREEN" />
          <h1>Trailcare</h1>
        </div>
        <p className="login-intro">Trailpflege für die Stuttgarter Trails. Das Passwort bekommst du von deiner Crew.</p>
        <label className="field">
          <span>Passwort</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoFocus
          />
        </label>
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        <button className="button button-primary" type="submit" disabled={isPending || !password}>
          Anmelden
        </button>
      </form>
    </main>
  )
}

function loginErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response?.status === 429) {
    return 'Zu viele Versuche. Warte eine Minute und probier es dann nochmal.'
  }
  if (isAxiosError(error) && error.response?.status === 401) {
    return 'Das Passwort stimmt nicht.'
  }
  return errorMessage(error)
}
