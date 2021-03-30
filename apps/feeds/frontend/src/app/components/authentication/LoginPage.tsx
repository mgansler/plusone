import { Button, CircularProgress, Paper, Typography } from '@material-ui/core'
import React from 'react'
import { useQuery } from 'react-apollo'

import { AuthorizationUri, AuthorizationUriQuery } from '../../graphql'

import { useAuthenticationStyles } from './styles'

export const LoginPage: React.FC = () => {
  const classNames = useAuthenticationStyles()

  const { loading, data } = useQuery<AuthorizationUriQuery>(AuthorizationUri)

  if (loading) {
    return <CircularProgress className={classNames.loading} />
  }

  return (
    <Paper className={classNames.root}>
      <Typography align={'center'}>Please login</Typography>
      <Button href={data?.authorizationUri}>Login with GitLab</Button>
    </Paper>
  )
}
