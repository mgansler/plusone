import type { Theme } from '@mui/material'
import { FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Toolbar } from '@mui/material'
import { createStyles, makeStyles } from '@mui/styles'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MutableRefObject, RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom'

import { OrganizationsDocument } from '@plusone/github-schema'
import type { OrganizationsQuery } from '@plusone/github-schema'
import { useGitHubPagination } from '@plusone/github-hooks'

import { useOctokit } from '../octokit-provider/octokit-provider'
import { RepositoryOverview } from '../repository-overview/repository-overview'

const useOrganizationName = (): string => {
  const match = useMatch('/organization/:organizationName')
  return match?.params.organizationName || ''
}

const PAGE_SIZE = 100
const useFetchOrganizations = () => {
  const { pages, onSuccess, getPageRequest } = useGitHubPagination(PAGE_SIZE)

  const octokit = useOctokit()
  const { data, isLoading } = useQuery<OrganizationsQuery>({
    queryKey: ['organizations', pages.currentPage],
    queryFn: async () =>
      octokit.graphql<OrganizationsQuery>(OrganizationsDocument, { first: PAGE_SIZE, after: getPageRequest() }),
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (!isLoading && data) {
      onSuccess(data.viewer.organizations.pageInfo, data.viewer.organizations.totalCount)
    }
  }, [data, isLoading, onSuccess])

  return { data, isLoading }
}

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    toolbar: {
      gap: theme.spacing(1),
    },
    formControl: {
      minWidth: 200,
    },
  }),
)

export function Organizations() {
  const classNames = useStyles()

  const navigate = useNavigate()
  const organizationName = useOrganizationName()

  const { data, isLoading } = useFetchOrganizations()

  const toolbar = useRef<HTMLDivElement>()

  if (isLoading || data === undefined) {
    return <LinearProgress />
  }

  return (
    <Paper>
      <Toolbar className={classNames.toolbar} ref={toolbar as RefObject<HTMLDivElement>}>
        <FormControl className={classNames.formControl}>
          <InputLabel id={'select-org-label'}>Select Organization</InputLabel>
          <Select
            labelId={'select-org-label'}
            value={organizationName}
            onChange={(event) => navigate(`/organization/${event.target.value}`)}
          >
            {organizationName === '' && <MenuItem value={''} />}
            {data.viewer.organizations.nodes?.map((organization) =>
              organization === null ? null : (
                <MenuItem key={organization.id} value={organization.login}>
                  {organization.name}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Toolbar>

      <Routes>
        <Route path={'/'} element={null} />
        <Route
          path={'/organization/:organizationName'}
          element={<RepositoryOverview toolbarRef={toolbar as MutableRefObject<HTMLDivElement>} />}
        />
      </Routes>
    </Paper>
  )
}
