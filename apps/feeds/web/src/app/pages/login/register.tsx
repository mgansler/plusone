import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

type RegisterForm = {
  username: string
  password: string
}

export function Register() {
  const navigate = useNavigate()

  const { register, handleSubmit } = useForm<RegisterForm>()
  const { mutateAsync } = useMutation(['register'], (body: RegisterForm) =>
    fetch('/api/authentication/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json()),
  )

  const onSubmit = async (data: RegisterForm) => {
    await mutateAsync(data)
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
