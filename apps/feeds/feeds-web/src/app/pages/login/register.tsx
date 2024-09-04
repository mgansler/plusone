import { Button, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { LoginCard } from '@plusone/components'
import { useRegister } from '@plusone/feeds/api-client'

type RegisterForm = {
  username: string
  password: string
}

export function Register() {
  const navigate = useNavigate()

  const { register, handleSubmit } = useForm<RegisterForm>()

  const { mutateAsync } = useRegister()

  const onSubmit = async (data: RegisterForm) => {
    await mutateAsync({ data })
    navigate('/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <LoginCard>
        <Typography>Register</Typography>

        <TextField fullWidth={true} label={'Username'} {...register('username')} />
        <TextField fullWidth={true} label={'Password'} type={'password'} {...register('password')} />

        <Button type={'submit'} color={'primary'}>
          register
        </Button>
      </LoginCard>
    </form>
  )
}
