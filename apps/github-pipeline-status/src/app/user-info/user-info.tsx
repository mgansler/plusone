import { User } from '@plusone/github-schema'
import React from 'react'
import { useQuery } from 'react-query'
import { createUseStyles } from 'react-jss'

import { useLogout, useOctokit } from '../octokit-provider/octokit-provider'

const useUserInfoStyles = createUseStyles({
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    borderRadius: '50%',
  },
})

export const UserInfo: React.FC = () => {
  const classnames = useUserInfoStyles()

  const octokit = useOctokit()
  const logout = useLogout()

  const { data, isLoading } = useQuery('currentUser', async () => {
    return await octokit.graphql<{ viewer: Partial<User> }>(`
      query {
        viewer {
          login
          avatarUrl
        }
      }
    `)
  })

  if (isLoading) {
    return null
  }

  return (
    <div className={classnames.container}>
      <img
        className={classnames.avatar}
        src={data.viewer.avatarUrl}
        alt={data.viewer.login}
        height={32}
        width={32}
      />
      {data.viewer.login}
      <button onClick={logout}>Logout</button>
    </div>
  )
}
