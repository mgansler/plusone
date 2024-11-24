import { LinearProgress } from '@mui/material'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGitHubPagination } from '@plusone/github-hooks'
import type { OrganizationsQuery } from '@plusone/github-schema'
import { OrganizationsDocument } from '@plusone/github-schema'

import { useOctokit } from '../octokit-provider/octokit-provider'

const PAGE_SIZE = 100
export const useFetchOrganizations = () => {
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

export function OrganizationsBootstrap() {
  const { data, isLoading } = useFetchOrganizations()
  const navigate = useNavigate()

  if (isLoading || data === undefined) {
    return <LinearProgress />
  } else if (Array.isArray(data.viewer.organizations.nodes)) {
    navigate(`/organization/${data.viewer.organizations.nodes[0]?.login}`)
  }
}
