import React, { useState } from 'react'
import {
  Organization,
  PageInfo,
  Repository,
  SearchType,
} from '@plusone/github-schema'
import { useGitHubPagination } from '@plusone/hooks'
import { useQuery } from 'react-query'

import { useOctokit } from '../octokit-provider/octokit-provider'

import { RepositoryWithPrs } from './repository-with-prs'

const PAGE_SIZE = 20

export interface RepositoryOverviewProps {
  organizationName: Organization['name']
}

export const RepositoryOverview = ({
  organizationName,
}: RepositoryOverviewProps) => {
  const octokit = useOctokit()

  const {
    pages,
    onSuccess,
    nextPage,
    prevPage,
    getPageRequest,
  } = useGitHubPagination(PAGE_SIZE)

  const [queryString, setQueryString] = useState<string>('')

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
              pullRequests(first: 20, states: OPEN) {
                totalCount
                nodes {
                  number
                  title
                  commits (last: 1) {
                    totalCount
                    nodes {
                      commit {
                        checkSuites(last: 1) {
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
      onSuccess: (response) =>
        onSuccess(response.search.pageInfo, response.search.repositoryCount),
    },
  )

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h1>Repositories of {organizationName}</h1>

      <label>
        Filter
        <input
          type={'text'}
          onChange={(event) => setQueryString(event.currentTarget.value)}
        />
      </label>

      <h4>
        Page {pages.currentPage + 1} of {pages.totalPages} (
        {data.search.repositoryCount} entries)
      </h4>

      {data.search.nodes.map((repository) => {
        return <RepositoryWithPrs key={repository.id} {...repository} />
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
