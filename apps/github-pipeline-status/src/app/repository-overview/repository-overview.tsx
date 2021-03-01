import React, { useEffect, useState } from 'react'
import { useGitHubPagination, useLocalStorage } from '@plusone/hooks'
import { useHistory, useParams } from 'react-router-dom'
import { Input, Select } from '@plusone/input'
import { createUseStyles } from 'react-jss'
import { useQuery } from 'react-query'
import {
  PageInfo,
  PullRequestState,
  Repository,
  SearchType,
} from '@plusone/github-schema'

import { useOctokit } from '../octokit-provider/octokit-provider'

import { RepositoryWithPrs, UserFilter } from './repository-with-prs'
import { useTableStyles } from './use-table-styles'

const useRepositoryStyles = createUseStyles({
  toolbar: {
    display: 'flex',
    gap: 8,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
})

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
                  number
                  title
                  author {
                    login
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

export const RepositoryOverview = () => {
  const classNames = { ...useRepositoryStyles(), ...useTableStyles() }

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

  // Fetch the data
  const { data, isLoading, pages, prevPage, nextPage } = useFetchRepositoryData(
    {
      organizationName,
      queryString,
    },
  )

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <React.Fragment>
      <h2>Repositories of {organizationName}</h2>

      <div className={classNames.toolbar}>
        <Input
          label={'Repository Name'}
          type={'text'}
          value={queryString}
          onChange={(event) => setQueryString(event.currentTarget.value)}
        />

        <Select
          label={'Filter details by user'}
          onChange={(event) =>
            setUserFilter(event.currentTarget.value as UserFilter)
          }
          value={userFilter}
        >
          <option value="all">Show all</option>
          <option value="dependabot">Show dependabot only</option>
          <option value="user">Show user only</option>
        </Select>
      </div>

      <table className={classNames.table}>
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '2%' }} />
          <col style={{ width: '2%' }} />
          <col style={{ width: '2%' }} />
          <col style={{ width: '50%' }} />
        </colgroup>

        <thead>
          <tr>
            <th>Name</th>
            <th>Default Branch</th>
            <th>Open PRs</th>
            <th>&#x2713;</th>
            <th>&#x2717;</th>
            <th>other</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {data.search.nodes.map((repository) => {
            return (
              <RepositoryWithPrs
                key={repository.id}
                repository={repository}
                userFilter={userFilter}
              />
            )
          })}
        </tbody>
      </table>

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
