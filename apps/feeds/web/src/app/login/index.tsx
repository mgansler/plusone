import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import type { LoginResponse } from '@plusone/feeds/shared/types'

type LoginForm = {
  username: string
  password: string
}

export function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<LoginForm>()

  const { mutateAsync } = useMutation<LoginResponse, any, LoginForm>(['login'], (body: LoginForm) =>
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
    navigate('/')
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
