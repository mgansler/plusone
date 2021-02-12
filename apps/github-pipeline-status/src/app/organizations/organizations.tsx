import React from 'react'
import { useQuery } from 'react-query'
import { User } from '@plusone/github-schema'

import { useOctokit } from '../octokit-provider/octokit-provider'

export const Organizations: React.FC = () => {
  const octokit = useOctokit()

  const { data, isLoading } = useQuery('organizations', async () => {
    return await octokit.graphql<{
      viewer: Partial<User>
    }>(`
      query {
        viewer {
          organizations(first: 100) {
            totalCount
            pageInfo {
              endCursor
              hasNextPage
              hasPreviousPage
              startCursor
            }
            nodes {
              id
              name
            }
          }
        }
      }
    `)
  })

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {data.viewer.organizations.nodes.map((organization) => {
        return <div key={organization.id}>{organization.name}</div>
      })}
    </div>
  )
}
