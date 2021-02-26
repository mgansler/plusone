import React from 'react'
import { useQuery } from 'react-query'
import { User } from '@plusone/github-schema'
import { useGitHubPagination } from '@plusone/hooks'
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import { Select } from '@plusone/input'

import { useOctokit } from '../octokit-provider/octokit-provider'
import { RepositoryOverview } from '../repository-overview/repository-overview'

const PAGE_SIZE = 100

export const Organizations: React.FC = () => {
  const history = useHistory()
  const match = useRouteMatch<{ organizationName: string }>({
    strict: true,
    path: '/organization/:organizationName',
  })
  const organizationName = match ? match.params.organizationName : ''

  const { pages, onSuccess, getPageRequest } = useGitHubPagination(PAGE_SIZE)

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
    <React.Fragment>
      <Select
        label={'Select Organization'}
        value={organizationName}
        onChange={(event) =>
          history.push(`/organization/${event.currentTarget.value}`)
        }
      >
        {organizationName === '' && <option value="" />}
        {data.viewer.organizations.nodes.map((organization) => (
          <option key={organization.id} value={organization.login}>
            {organization.name}
          </option>
        ))}
      </Select>
      <Switch>
        <Route exact={true} path={'/organization/:organizationName'}>
          <RepositoryOverview />
        </Route>
      </Switch>
    </React.Fragment>
  )
}
