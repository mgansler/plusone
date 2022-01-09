import { Button } from '@mui/material'
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
    <div className={'container mx-auto p-4 mt-8 bg-white rounded-lg max-w-sm flex flex-col items-center shadow-lg'}>
      <h1 className={'text-3xl'}>Login</h1>
      <form method={'post'} className={'flex flex-col items-center'}>
        <fieldset className={'my-2'}>
          <div>
            <label className={'mx-1'}>
              <input className={'mr-1'} type={'radio'} name={'loginType'} value={'login'} defaultChecked={true} />
              Login
            </label>
            <label className={'mx-1'}>
              <input className={'mr-1'} type={'radio'} name={'loginType'} value={'register'} />
              Register
            </label>
          </div>
        </fieldset>
        <label className={'my-2 flex gap-4 text-sm'}>
          Username
          <input type={'text'} name={'username'} />
        </label>
        <label className={'my-2 flex gap-4 text-sm'}>
          Password
          <input type={'password'} name={'password'} />
        </label>
        <Button variant={'contained'} type={'submit'}>
          Submit
        </Button>
      </form>
    </div>
  )
}
