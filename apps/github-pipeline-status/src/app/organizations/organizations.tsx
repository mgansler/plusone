import React from 'react'
import { useQuery } from 'react-query'
import { User } from '@plusone/github-schema'
import { useGitHubPagination } from '@plusone/hooks'

import { useOctokit } from '../octokit-provider/octokit-provider'

export const Organizations: React.FC = () => {
  const octokit = useOctokit()

  const {
    pages,
    onSuccess,
    nextPage,
    prevPage,
    getPageRequest,
  } = useGitHubPagination()

  const { data, isLoading } = useQuery(
    ['organizations', pages.currentPage],
    async () => {
      return await octokit.graphql<{
        viewer: Partial<User>
      }>(`
      query {
        viewer {
          organizations(first: 2${getPageRequest()}) {
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
    },
    {
      keepPreviousData: true,
      onSuccess: (response) =>
        onSuccess(response.viewer.organizations.pageInfo),
    },
  )

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {data.viewer.organizations.nodes.map((organization) => {
        return <div key={organization.id}>{organization.name}</div>
      })}
      <button
        disabled={!pages[pages.currentPage]?.hasPreviousPage}
        onClick={prevPage}
      >
        Prev
      </button>
      <button
        disabled={!pages[pages.currentPage]?.hasNextPage}
        onClick={nextPage}
      >
        Next
      </button>
    </div>
  )
}
