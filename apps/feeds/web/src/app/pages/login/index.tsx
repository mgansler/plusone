import { Button, Link as MuiLink, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { LoginCard } from '@plusone/components'
import { useLogin } from '@plusone/feeds/api-client'

import { useUserContext } from '../../context/user'

type LoginForm = {
  username: string
  password: string
}

export function Login() {
  const { register, handleSubmit } = useForm<LoginForm>()
  const { login } = useUserContext()

  const { mutateAsync } = useLogin()

  const onSubmit = async (data: LoginForm) => {
    const resp = await mutateAsync({ data })
    login(resp.data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <LoginCard>
        <Typography>Login</Typography>

        <TextField fullWidth={true} label={'Username'} {...register('username')} />
        <TextField fullWidth={true} label={'Password'} type={'password'} {...register('password')} />

        <Button type={'submit'} color={'primary'}>
          Login
        </Button>

        <MuiLink component={Link} to={'../register'}>
          I don't have an account
        </MuiLink>
      </LoginCard>
    </form>
  )
}
