import { Button, CircularProgress, Typography } from '@material-ui/core'
import React from 'react'
import { useQuery } from 'react-apollo'

import { AuthorizationUri, AuthorizationUriQuery } from '@plusone/feeds-schema'
import { LoginCard } from '@plusone/components'

import { useAuthenticationStyles } from './styles'

export const LoginPage: React.FC = () => {
  const classNames = useAuthenticationStyles()

  const { loading, data } = useQuery<AuthorizationUriQuery>(AuthorizationUri)

  if (loading) {
    return <CircularProgress className={classNames.loading} />
  }

  return (
    <LoginCard>
      <Typography variant={'h3'}>Welcome to Feeds</Typography>

      <Typography>Please login</Typography>

      <Button variant={'contained'} href={data?.authorizationUri}>
        Login with GitLab
      </Button>
    </LoginCard>
  )
}
