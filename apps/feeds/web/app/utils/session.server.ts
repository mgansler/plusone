import decode from 'jwt-decode'
import { createCookieSessionStorage, redirect } from 'remix'

import { baseUrl } from '~/entry.server'

type LoginForm = {
  username: string
  password: string
}

export async function login({ username, password }: LoginForm) {
  const resp = await fetch(`${baseUrl}/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })

  if (resp.status !== 201) {
    return null
  }

  return await resp.json()
}

export async function register({ username, password }: LoginForm) {
  const resp = await fetch(`${baseUrl}/authentication/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })

  if (resp.status !== 201) {
    return null
  }

  return await resp.json()
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'remix-feeds-session',
    secure: process.env.NODE_ENV === 'production',
    // FIXME provide session secret
    secrets: [],
    sameSite: 'lax',
    path: '/',
    maxAge: 3_600,
    httpOnly: true,
  },
})

type Token = {
  username: string
  isAdmin: boolean
  roles: string[]
  id: string
  iat: number
  exp: number
}

export async function createUserSession(token: string, redirectTo = '/') {
  const session = await storage.getSession()
  const { id, username, isAdmin } = decode<Token>(token)

  session.set('token', token)
  session.set('id', id)
  session.set('username', username)
  session.set('isAdmin', isAdmin)

  return redirect(isAdmin ? '/admin' : redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function getUserSession(request: Request) {
  return await storage.getSession(request.headers.get('Cookie'))
}

export type User = {
  id: string
  username: string
  isAdmin: boolean
}

export async function requireUser(request: Request): Promise<User> {
  const session = await getUserSession(request)
  return {
    id: session.get('id'),
    username: session.get('username'),
    isAdmin: session.get('isAdmin'),
  }
}
