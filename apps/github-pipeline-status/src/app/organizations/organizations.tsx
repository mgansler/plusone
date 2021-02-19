import React from 'react'
import { useQuery } from 'react-query'
import { User } from '@plusone/github-schema'
import { useGitHubPagination } from '@plusone/hooks'
import { Route, Switch, useHistory } from 'react-router-dom'

import { useOctokit } from '../octokit-provider/octokit-provider'
import { RepositoryOverview } from '../repository-overview/repository-overview'

const PAGE_SIZE = 10

export const Organizations: React.FC = () => {
  const history = useHistory()

  const {
    pages,
    onSuccess,
    nextPage,
    prevPage,
    getPageRequest,
  } = useGitHubPagination(PAGE_SIZE)

  const octokit = useOctokit()
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

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {data.viewer.organizations.nodes.map((organization) => {
        return (
          <div key={organization.id}>
            {organization.name}
            <button
              onClick={() =>
                history.push(`/organization/${organization.login}`)
              }
            >
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
      <Switch>
        <Route exact={true} path={'/organization/:organizationName'}>
          <RepositoryOverview />
        </Route>
      </Switch>
    </div>
  )
}
