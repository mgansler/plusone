import type { ActionFunction } from 'remix'

import { badRequest } from '~/utils/bad-request'
import { createUserSession, login } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const loginType = form.get('loginType')
  const username = form.get('username') as string
  const password = form.get('password') as string

  switch (loginType) {
    case 'login': {
      const resp = await login({ username, password })
      if (!resp) {
        return badRequest({}, 401)
      }
      return createUserSession(resp.access_token)
    }
    case 'register': {
      return badRequest({})
    }
  }
}

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form method={'post'}>
        <fieldset>
          <legend>Login or Register?</legend>
          <label>
            <input type={'radio'} name={'loginType'} value={'login'} defaultChecked={true} />
            Login
          </label>
          <label>
            <input type={'radio'} name={'loginType'} value={'register'} />
            Register
          </label>
        </fieldset>
        <label>
          Username
          <input type={'text'} name={'username'} />
        </label>
        <label>
          Password
          <input type={'password'} name={'password'} />
        </label>
        <button type={'submit'}>Submit</button>
      </form>
    </div>
  )
}
