import React, { useRef } from 'react'
import { useQuery } from 'react-query'
import { User } from '@plusone/github-schema'
import { useGitHubPagination } from '@plusone/hooks'
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom'
import {
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Toolbar,
} from '@material-ui/core'

import { useOctokit } from '../octokit-provider/octokit-provider'
import { RepositoryOverview } from '../repository-overview/repository-overview'

const useOrganizationName = () => {
  const match = useRouteMatch<{ organizationName: string }>({
    strict: true,
    path: '/organization/:organizationName',
  })
  return match ? match.params.organizationName : ''
}

const PAGE_SIZE = 100
const useFetchOrganizations = () => {
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

  return { data, isLoading }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: {
      gap: theme.spacing(1),
    },
    formControl: {
      minWidth: 200,
    },
  }),
)

export const Organizations: React.FC = () => {
  const classNames = useStyles()

  const history = useHistory()
  const organizationName = useOrganizationName()

  const { data, isLoading } = useFetchOrganizations()

  const toolbar = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <Paper>
      <Toolbar className={classNames.toolbar} ref={toolbar}>
        <FormControl className={classNames.formControl}>
          <InputLabel id={'select-org-label'}>Select Organization</InputLabel>
          <Select
            labelId={'select-org-label'}
            value={organizationName}
            onChange={(event) =>
              history.push(`/organization/${event.target.value}`)
            }
          >
            {organizationName === '' && <MenuItem value="" />}
            {data.viewer.organizations.nodes.map((organization) => (
              <MenuItem key={organization.id} value={organization.login}>
                {organization.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>

      <Switch>
        <Route exact={true} path={'/organization/:organizationName'}>
          <RepositoryOverview toolbarRef={toolbar} />
        </Route>
      </Switch>
    </Paper>
  )
}
