import React, { useState } from 'react'
import { useOctokit } from '../octokit-provider/octokit-provider'
import { useQuery } from 'react-query'

type Repository = {
  id: string
  name: string
}

type Organization = {
  id: string
  name: string
  repositories: {
    totalCount: number
    nodes: Repository[]
  }
}

export const Organizations: React.FC = () => {
  const octokit = useOctokit()

  const { data, isLoading } = useQuery('organizations', async () => {
    return await octokit.graphql<{
      viewer: { organizations: { nodes: Organization[] } }
    }>(`
      query {
        viewer {
          organizations(first: 100) {
            totalCount
            nodes {
              id
              name
              repositories(first: 100) {
                totalCount
                pageInfo
                nodes {
                  id
                  name
                }
              }
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
        return (
          <div key={organization.id}>
            {organization.name} ({organization.repositories.totalCount})
            {organization.repositories.nodes.map((repository) => {
              return (
                <div key={repository.id}>&nbsp;&nbsp;{repository.name}</div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
