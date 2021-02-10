import React from 'react'
import { useLogout, useOctokit } from '../octokit-provider/octokit-provider'
import { useQuery } from 'react-query'

type User = {
  viewer: {
    login: string
    avatarUrl: string
  }
}

export const UserInfo: React.FC = () => {
  const octokit = useOctokit()
  const logout = useLogout()

  const { data, isLoading } = useQuery('test', async () => {
    return await octokit.graphql<User>(`
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
    <span>
      {data.viewer.login}
      <img
        src={data.viewer.avatarUrl}
        alt={data.viewer.login}
        height={32}
        width={32}
      />
      <button onClick={logout}>Logout</button>
    </span>
  )
}
