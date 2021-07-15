import { useCallback, useState } from 'react'

import { PageInfo } from '@plusone/github-schema'

type PageMeta = {
  currentPage: number
  totalPages: number
}

type Pages = Record<number, PageInfo> & PageMeta

type GitHubPagination = {
  pages: Pages
  onSuccess: (pageInfo: PageInfo, elementCount: number) => void
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  getPageRequest: () => string | null
}

export const useGitHubPagination = (pageSize: number): GitHubPagination => {
  const [pages, setPages] = useState<Pages>({ currentPage: 0, totalPages: 0 })

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

  const onSuccess = (pageInfo: PageInfo, elementCount: number) => {
    setPages((prevState) => ({
      ...prevState,
      totalPages: Math.floor(elementCount / pageSize) + 1,
      [pages.currentPage]: pageInfo,
    }))
  }

  const getPageRequest = () => (pages[pages.currentPage - 1] ? pages[pages.currentPage - 1].endCursor : null)

  const goToPage = useCallback((page: number) => {
    setPages((prevState) => ({ ...prevState, currentPage: page }))
  }, [])

  return {
    pages,
    onSuccess,
    nextPage,
    prevPage,
    goToPage,
    getPageRequest,
  }
}
