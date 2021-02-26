import React, { useState } from 'react'
import {
  PageInfo,
  PullRequestState,
  Repository,
  SearchType,
} from '@plusone/github-schema'
import { useGitHubPagination, useLocalStorage } from '@plusone/hooks'
import { useQuery } from 'react-query'
import { useHistory, useParams } from 'react-router-dom'

import { useOctokit } from '../octokit-provider/octokit-provider'

import { RepositoryWithPrs, UserFilter } from './repository-with-prs'

const PAGE_SIZE = 20

export const RepositoryOverview = () => {
  const { organizationName } = useParams<{ organizationName: string }>()
  const history = useHistory()

  const [queryString, setQueryString] = useState<string>(() => {
    const urlSearchParams = new URLSearchParams(history.location.search)
    return urlSearchParams.get('filter') || ''
  })

  const [userFilter, setUserFilter] = useLocalStorage<UserFilter>(
    'userDetailsFilter',
    'all',
  )

  const {
    pages,
    onSuccess,
    nextPage,
    prevPage,
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
                  author {
                    login
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
        history.push({
          search: `filter=${queryString}`,
        })
        onSuccess(response.search.pageInfo, response.search.repositoryCount)
      },
    },
  )

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h1>Repositories of {organizationName}</h1>

      <label>
        Repository Name
        <input
          type={'text'}
          value={queryString}
          onChange={(event) => setQueryString(event.currentTarget.value)}
        />
      </label>

      <label>
        Filter details by user
        <select
          onChange={(event) =>
            setUserFilter(event.currentTarget.value as UserFilter)
          }
          value={userFilter}
        >
          <option value="all">Show all</option>
          <option value="dependabot">Show dependabot only</option>
          <option value="user">Show user only</option>
        </select>
      </label>

      <table>
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
  )
}
