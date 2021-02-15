import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { PageInfo, User } from '@plusone/github-schema'

import { useOctokit } from '../octokit-provider/octokit-provider'

type Pages = Record<number, PageInfo> & { currentPage: number }

const getPageQuery = (pages: Pages): string => {
  if (pages[pages.currentPage - 1]) {
    return `, after: "${pages[pages.currentPage - 1].endCursor}"`
  }

  return ''
}

export const Organizations: React.FC = () => {
  const octokit = useOctokit()

  const [pages, setPages] = useState<Pages>({ currentPage: 0 })

  const { data, isLoading } = useQuery(
    ['organizations', pages.currentPage],
    async () => {
      return await octokit.graphql<{
        viewer: Partial<User>
      }>(`
      query {
        viewer {
          organizations(first: 2${getPageQuery(pages)}) {
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
            }
          }
        }
      }
    `)
    },
    {
      keepPreviousData: true,
      onSuccess: (response) => {
        if (!pages[pages.currentPage]) {
          setPages((prevState) => ({
            ...prevState,
            [pages.currentPage]: response.viewer.organizations.pageInfo,
          }))
        }
      },
    },
  )

  const prevPage = () => {
    setPages((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage - 1,
    }))
  }

  const nextPage = () => {
    setPages((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage + 1,
    }))
  }

  if (isLoading) {
    return <div>loading...</div>
  }

  return (
    <div>
      {data.viewer.organizations.nodes.map((organization) => {
        return <div key={organization.id}>{organization.name}</div>
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
