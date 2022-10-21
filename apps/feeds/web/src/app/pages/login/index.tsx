import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { useAuthenticationControllerLogin } from '@plusone/feeds/api-client'

import { useUserContext } from '../../context/user'

type LoginForm = {
  username: string
  password: string
}

export function Login() {
  const { register, handleSubmit } = useForm<LoginForm>()
  const { login } = useUserContext()

  const { mutateAsync } = useAuthenticationControllerLogin()

  const onSubmit = async (data: LoginForm) => {
    const resp = await mutateAsync({ data })
    login(resp.data)
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
