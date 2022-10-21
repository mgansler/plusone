import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useAuthenticationControllerRegister } from '@plusone/feeds/api-client'

type RegisterForm = {
  username: string
  password: string
}

export function Register() {
  const navigate = useNavigate()

  const { register, handleSubmit } = useForm<RegisterForm>()

  const { mutateAsync } = useAuthenticationControllerRegister()

  const onSubmit = async (data: RegisterForm) => {
    await mutateAsync({ data })
    navigate('/login')
  }

  return (
    <div>
      <h3>Register</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          Username
          <input type={'text'} aria-label={'username'} {...register('username')} />
        </label>
        <label>
          Password
          <input type={'password'} aria-label={'password'} {...register('password')} />
        </label>
        <button>register</button>
      </form>
    </div>
  )
}
