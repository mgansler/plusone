import React, { useEffect, useState } from 'react'
import { useGitHubPagination, useLocalStorage } from '@plusone/hooks'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  PageInfo,
  PullRequestState,
  Repository,
  SearchType,
} from '@plusone/github-schema'
import {
  createStyles,
  FormControl,
  FormControlLabel,
  InputLabel,
  makeStyles,
  MenuItem,
  Portal,
  Select,
  Switch,
  TextField,
} from '@material-ui/core'

import { useOctokit } from '../octokit-provider/octokit-provider'

import { AccordionSkeleton, RepositoryAccordion } from './repository-accordion'

export type UserFilter = 'all' | 'dependabot' | 'user'

// TODO: remove me when pagination is styled
const useRepositoryStyles = makeStyles((theme) =>
  createStyles({
    pagination: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  }),
)

const useStyles = makeStyles((theme) =>
  createStyles({
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

const useFetchRepositoryData = ({
  organizationName,
  queryString,
}: UseFetchRepositoryDataProps) => {
  const history = useHistory()

  const {
    pages,
    onSuccess,
    nextPage,
    prevPage,
    goToPage,
    getPageRequest,
  } = useGitHubPagination(PAGE_SIZE)

  const octokit = useOctokit()
  const { data, isLoading } = useQuery(
    ['repositories', organizationName, queryString, pages.currentPage],
    async () => {
      return await octokit.graphql<{
        search: {
          repositoryCount: number
          pageInfo: PageInfo
          nodes: Repository[]
        }
      }>(`
      query {
        search(first: ${PAGE_SIZE}, type: ${
        SearchType.Repository
      }, query: "org:${organizationName} ${queryString}"${getPageRequest()}) {
          repositoryCount
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
          nodes {
            ... on Repository {
              name
              id
              url
              defaultBranchRef {
                name
                ... on Ref {
                  target {
                    ... on Commit {
                      checkSuites (last: 1) {
                        nodes {
                          conclusion
                        }
                      }
                    }
                  }
                }
              }
              pullRequests (first: 20, states: ${PullRequestState.Open}) {
                totalCount
                nodes {
                  isDraft
                  mergeable
                  number
                  title
                  author {
                    login
                    ... on User {
                      name
                    }
                  }
                  url
                  commits (last: 1) {
                    totalCount
                    nodes {
                      commit {
                        checkSuites (last: 1) {
                          nodes {
                            conclusion
                          }
                        }
                      }
                    }
                  }
                  headRef {
                    name
                  }
                  reviews (last: 20) {
                    nodes {
                      author {
                        login
                        ... on User {
                          name
                        }
                      }
                      state
                    }
                  }
                }
              }
            }
          }
        }
      }
    `)
    },
    {
      keepPreviousData: true,
      refetchInterval: 30000,
      refetchIntervalInBackground: true,
      onSuccess: (response) => {
        const urlSearchParams = new URLSearchParams(history.location.search)
        urlSearchParams.set('filter', queryString)
        history.push({
          search: urlSearchParams.toString(),
        })
        onSuccess(response.search.pageInfo, response.search.repositoryCount)
      },
    },
  )

  useEffect(() => goToPage(0), [goToPage, queryString])

  return { data, isLoading, pages, prevPage, nextPage }
}

interface RepositoryOverviewProps {
  toolbarRef: React.MutableRefObject<HTMLDivElement>
}

export const RepositoryOverview: React.FC<RepositoryOverviewProps> = ({
  toolbarRef,
}) => {
  const classNames = {
    ...useRepositoryStyles(),
    ...useStyles(),
  }

  // Get the request params
  const { organizationName } = useParams<{ organizationName: string }>()
  const history = useHistory()
  const [queryString, setQueryString] = useState<string>(
    () => new URLSearchParams(history.location.search).get('filter') || '',
  )
  const [userFilter, setUserFilter] = useLocalStorage<UserFilter>({
    key: 'userDetailsFilter',
    defaultValue: 'all',
  })

  const [showOnlyOpenPRs, setShowReposWithoutPRs] = useLocalStorage<boolean>({
    key: 'showOnlyOpenPRs',
    defaultValue: false,
  })

  // Fetch the data
  const { data, isLoading, pages, prevPage, nextPage } = useFetchRepositoryData(
    {
      organizationName,
      queryString,
    },
  )

  if (isLoading) {
    return (
      <React.Fragment>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
          <AccordionSkeleton key={value} />
        ))}
      </React.Fragment>
    )
  }

  const filteredRepositories = data.search.nodes.filter(
    (repo) => !showOnlyOpenPRs || repo.pullRequests.totalCount > 0,
  )

  return (
    <React.Fragment>
      <Portal container={toolbarRef.current}>
        <TextField
          className={classNames.formControl}
          label={'Repository Name'}
          type={'text'}
          value={queryString}
          onChange={(event) => setQueryString(event.target.value)}
        />

        <FormControl className={classNames.formControl}>
          <InputLabel id={'user-details-filter-label'}>
            Filter details by user
          </InputLabel>
          <Select
            labelId={'user-details-filter-label'}
            id={'user-details-filter'}
            onChange={(event) =>
              setUserFilter(event.target.value as UserFilter)
            }
            value={userFilter}
          >
            <MenuItem value="all">Show all</MenuItem>
            <MenuItem value="dependabot">Show dependabot only</MenuItem>
            <MenuItem value="user">Show user only</MenuItem>
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
      </Portal>

      {filteredRepositories.map((repo) => (
        <RepositoryAccordion
          key={repo.id}
          userFilter={userFilter}
          repository={repo}
        />
      ))}

      <div className={classNames.pagination}>
        <h4>
          Page {pages.currentPage + 1} of {pages.totalPages} (
          {data.search.repositoryCount} entries)
        </h4>

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
    </React.Fragment>
  )
}
