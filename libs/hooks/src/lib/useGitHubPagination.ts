import { PageInfo } from '@plusone/github-schema'
import { useState } from 'react'

type Pages = Record<number, PageInfo> & { currentPage: number }
type GitHubPagination = {
  pages: Pages
  onSuccess: (pageInfo: PageInfo) => void
  nextPage: () => void
  prevPage: () => void
  getPageRequest: () => string
}

export const useGitHubPagination = (): GitHubPagination => {
  const [pages, setPages] = useState<Pages>({ currentPage: 0 })

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

  const onSuccess = (pageInfo: PageInfo) => {
    if (!pages[pages.currentPage]) {
      setPages((prevState) => ({
        ...prevState,
        [pages.currentPage]: pageInfo,
      }))
    }
  }

  const getPageRequest = () => {
    if (pages[pages.currentPage - 1]) {
      return `, after: "${pages[pages.currentPage - 1].endCursor}"`
    }

    return ''
  }

  return {
    pages,
    onSuccess,
    nextPage,
    prevPage,
    getPageRequest,
  }
}
