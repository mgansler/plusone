import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from '@material-ui/core'
import React from 'react'
import { useQuery } from 'react-apollo'
import { AuthorizationUri, AuthorizationUriQuery } from '@plusone/feeds-schema'

import { useAuthenticationStyles } from './styles'

export const LoginPage: React.FC = () => {
  const classNames = useAuthenticationStyles()

  const { loading, data } = useQuery<AuthorizationUriQuery>(AuthorizationUri)

  if (loading) {
    return <CircularProgress className={classNames.loading} />
  }

  return (
    <Container maxWidth={'sm'} className={classNames.container}>
      <Card>
        <CardContent className={classNames.root}>
          <Typography variant={'h3'} align={'center'}>
            Welcome to Feeds
          </Typography>
          <Typography align={'center'}>Please login</Typography>
          <Button variant={'contained'} href={data?.authorizationUri}>
            Login with GitLab
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}
