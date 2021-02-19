import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Organization, User } from '@plusone/github-schema'
import { useGitHubPagination } from '@plusone/hooks'

import { useOctokit } from '../octokit-provider/octokit-provider'
import { RepositoryOverview } from '../repository-overview/repository-overview'

const PAGE_SIZE = 10

export const Organizations: React.FC = () => {
  const octokit = useOctokit()

  const {
    pages,
    onSuccess,
    nextPage,
    prevPage,
    getPageRequest,
  } = useGitHubPagination(PAGE_SIZE)

  const { data, isLoading } = useQuery(
    ['organizations', pages.currentPage],
    async () => {
      return await octokit.graphql<{
        viewer: Partial<User>
      }>(`
      query {
        viewer {
          organizations(first: ${PAGE_SIZE}${getPageRequest()}) {
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
              login
            }
          }
        }
      }
    `)
    },
    {
      keepPreviousData: true,
      onSuccess: (response) =>
        onSuccess(
          response.viewer.organizations.pageInfo,
          response.viewer.organizations.totalCount,
        ),
    },
  )

  const [openOrganization, setOpenOrganization] = useState<
    Organization['name']
  >()

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {data.viewer.organizations.nodes.map((organization) => {
        return (
          <div key={organization.id}>
            {organization.name}
            <button onClick={() => setOpenOrganization(organization.login)}>
              Expand
            </button>
          </div>
        )
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
      {openOrganization ? (
        <RepositoryOverview organizationName={openOrganization} />
      ) : null}
    </div>
  )
}
