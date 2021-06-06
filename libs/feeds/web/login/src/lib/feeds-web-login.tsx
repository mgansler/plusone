import { FormEventHandler } from 'react'
import { Button, TextField } from '@material-ui/core'

/* eslint-disable-next-line */
export interface FeedsWebLoginProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function FeedsWebLogin({ onSubmit }: FeedsWebLoginProps) {
  return (
    <div>
      <h1>Welcome to feeds-web-login!</h1>
      <form onSubmit={onSubmit}>
        <TextField id={'username'} name={'username'} type={'text'} label={'Username'} />
        <TextField id={'password'} name={'password'} type={'password'} label={'Password'} />
        <Button type={'submit'}>Login</Button>
      </form>
    </div>
  )
}
