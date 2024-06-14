export type Article = {
  content: string | null
  date: Date
  guid: string
  id: string
  link: string | null
  title: string | null
}

export type ArticleResponse = {
  article: Article
  cursor: number
  starred: boolean
  unread: boolean
}

export type ToggleUnreadRequest = {
  unread: boolean
}
