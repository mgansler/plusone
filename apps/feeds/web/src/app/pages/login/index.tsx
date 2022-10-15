import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import type { LoginResponse } from '@plusone/feeds/shared/types'

import { useUserContext } from '../../context/user'

type LoginForm = {
  username: string
  password: string
}

export function Login() {
  const { register, handleSubmit } = useForm<LoginForm>()
  const { login } = useUserContext()

  const { mutateAsync } = useMutation<LoginResponse, unknown, LoginForm>(['login'], (body: LoginForm) =>
    fetch('/api/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json()),
  )

  const onSubmit = async (data: LoginForm) => {
    const resp = await mutateAsync(data)
    login(resp)
  }

  return (
    <div>
      <h3>login</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Username
          <input type={'text'} aria-label={'username'} {...register('username')} />
        </label>
        <label>
          Password
          <input type={'password'} aria-label={'password'} {...register('password')} />
        </label>
        <button>login</button>
      </form>
      <Link to={'/login/register'}>I don't have an account</Link>
    </div>
  )
}
