import { baseUrl } from '../../entry.server'
import { getUserSession } from '../session.server'
import type { FeedResponse } from '../types/feed'
import type { PaginatedArticles } from '../types/pagination'

export async function fetchFeed(request: Request, id: string): Promise<PaginatedArticles> {
  const session = await getUserSession(request)

  const response = await fetch(`${baseUrl}/feed/${id}`, {
    headers: {
      Authorization: `bearer ${session.get('token')}`,
    },
  })

  return response.json()
}

export async function fetchFeeds(request: Request): Promise<FeedResponse[]> {
  const session = await getUserSession(request)

  const response = await fetch(`${baseUrl}/feed`, {
    headers: {
      Authorization: `bearer ${session.get('token')}`,
    },
  })

  if (response.status === 200) {
    return response.json()
  }

  return []
}
