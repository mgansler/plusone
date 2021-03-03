import { User } from '@plusone/github-schema'
import React from 'react'
import { useQuery } from 'react-query'
import { Avatar, Button, Typography } from '@material-ui/core'

import { useLogout, useOctokit } from '../octokit-provider/octokit-provider'

const useFetchUserInfo = () => {
  const octokit = useOctokit()

  const { data, isLoading } = useQuery('currentUser', async () => {
    return await octokit.graphql<{ viewer: Partial<User> }>(`
      query {
        viewer {
          login
          name
          avatarUrl
        }
      }
    `)
  })

  return { data, isLoading }
}

export const UserInfo: React.FC = () => {
  const logout = useLogout()
  const { data, isLoading } = useFetchUserInfo()

  if (isLoading) {
    return null
  }

  return (
    <React.Fragment>
      <Avatar src={data.viewer.avatarUrl} alt={data.viewer.login} />
      <Typography>{data.viewer.name ?? data.viewer.login}</Typography>
      <Button variant={'contained'} onClick={logout}>
        Logout
      </Button>
    </React.Fragment>
  )
}
