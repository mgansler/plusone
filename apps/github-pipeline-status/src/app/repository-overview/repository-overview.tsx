import { Portal } from '@mui/base'
import type { Theme } from '@mui/material'
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { useQuery } from '@tanstack/react-query'
import type { MutableRefObject } from 'react'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { useGitHubPagination } from '@plusone/github-hooks'
import type { RepositoryFieldsFragment, RepositoryOverviewQuery } from '@plusone/github-schema'
import { RepositoryOverviewDocument } from '@plusone/github-schema'
import { useLocalStorage } from '@plusone/hooks'

import { useOctokit } from '../octokit-provider/octokit-provider'

import { AccordionSkeleton, RepositoryAccordion } from './repository-accordion'

export type UserFilter = 'all' | 'dependabot' | 'user'

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    // TODO: remove me when pagination is styled
    pagination: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    formControl: {
      minWidth: 200,
    },
  }),
)

const PAGE_SIZE = 20

interface UseFetchRepositoryDataProps {
  organizationName: string
  queryString: string
}

const useFetchRepositoryData = ({ organizationName, queryString }: UseFetchRepositoryDataProps) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const { pages, onSuccess, nextPage, prevPage, goToPage, getPageRequest } = useGitHubPagination(PAGE_SIZE)

  const octokit = useOctokit()
  const { data, isLoading } = useQuery(
    ['repositories', organizationName, queryString, pages.currentPage],
    async () =>
      octokit.graphql<RepositoryOverviewQuery>(RepositoryOverviewDocument, {
        first: PAGE_SIZE,
        after: getPageRequest(),
        queryString: `org:${organizationName} ${queryString}`,
      }),
    {
      keepPreviousData: true,
      refetchInterval: 5_000,
      refetchIntervalInBackground: true,
      onSuccess: (response) => {
        searchParams.set('filter', queryString)
        setSearchParams(searchParams)
        onSuccess(response.search.pageInfo, response.search.repositoryCount)
      },
    },
  )

  useEffect(() => goToPage(0), [goToPage, queryString])

  return { data, isLoading, pages, prevPage, nextPage }
}

interface RepositoryOverviewProps {
  toolbarRef: MutableRefObject<HTMLDivElement>
}

export function RepositoryOverview({ toolbarRef }: RepositoryOverviewProps) {
  const classNames = useStyles()

  // Get the request params
  const { organizationName } = useParams<'organizationName'>()
  const [searchParams] = useSearchParams()
  const [queryString, setQueryString] = useState<string>(() => searchParams.get('filter') || '')
  const [userFilter, setUserFilter] = useLocalStorage<UserFilter>({
    key: 'userDetailsFilter',
    defaultValue: 'all',
  })

  const [showOnlyOpenPRs, setShowReposWithoutPRs] = useLocalStorage<boolean>({
    key: 'showOnlyOpenPRs',
    defaultValue: false,
  })

  const [showArchivedRepositories, setShowArchivedRepositories] = useLocalStorage<boolean>({
    key: 'showArchivedRepositories',
    defaultValue: false,
  })

  // Fetch the data
  const { data, isLoading, pages, prevPage, nextPage } = useFetchRepositoryData({
    organizationName,
    queryString,
  })

  if (isLoading) {
    return (
      <React.Fragment>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
          <AccordionSkeleton key={value} />
        ))}
      </React.Fragment>
    )
  }

  const filteredRepositories = data.search.nodes
    .filter((repo) => showArchivedRepositories || !(repo as RepositoryFieldsFragment).isArchived)
    .filter((repo) => !showOnlyOpenPRs || (repo as RepositoryFieldsFragment).pullRequests.totalCount > 0)

  return (
    <React.Fragment>
      <Portal container={toolbarRef.current}>
        <TextField
          className={classNames.formControl}
          id={'repository-name'}
          label={'Repository Name'}
          type={'text'}
          value={queryString}
          onChange={(event) => setQueryString(event.target.value)}
        />

        <FormControl className={classNames.formControl}>
          <InputLabel id={'user-details-filter-label'}>Filter details by user</InputLabel>
          <Select
            labelId={'user-details-filter-label'}
            id={'user-details-filter'}
            onChange={(event) => setUserFilter(event.target.value as UserFilter)}
            value={userFilter}
          >
            <MenuItem value={'all'}>Show all</MenuItem>
            <MenuItem value={'dependabot'}>Show dependabot only</MenuItem>
            <MenuItem value={'user'}>Show user only</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          label={'Show only open PRs'}
          control={
            <Switch
              checked={showOnlyOpenPRs}
              onChange={() => setShowReposWithoutPRs(!showOnlyOpenPRs)}
              color={'primary'}
            />
          }
        />

        <FormControlLabel
          label={'Show archived repositories'}
          control={
            <Switch
              checked={showArchivedRepositories}
              onChange={() => setShowArchivedRepositories(!showArchivedRepositories)}
              color={'primary'}
            />
          }
        />
      </Portal>

      {filteredRepositories.map((repo: RepositoryFieldsFragment) => (
        <RepositoryAccordion key={repo.id} userFilter={userFilter} repository={repo} />
      ))}

      <div className={classNames.pagination}>
        <h4>
          Page {pages.currentPage + 1} of {pages.totalPages} ({data.search.repositoryCount} entries)
        </h4>

        <button disabled={!pages[pages.currentPage]?.hasPreviousPage} onClick={prevPage}>
          Prev
        </button>
        <button disabled={!pages[pages.currentPage]?.hasNextPage} onClick={nextPage}>
          Next
        </button>
      </div>
    </React.Fragment>
  )
}
