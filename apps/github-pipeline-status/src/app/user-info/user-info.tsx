import React from 'react'
import { useQuery } from 'react-query'
import { Avatar, Button, Typography } from '@mui/material'

import type { UserQuery } from '@plusone/github-schema'
import { UserDocument } from '@plusone/github-schema'

import { useLogout, useOctokit } from '../octokit-provider/octokit-provider'

const useFetchUserInfo = () => {
  const octokit = useOctokit()
  return useQuery('currentUser', () => octokit.graphql<UserQuery>(UserDocument))
}

export function UserInfo() {
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
