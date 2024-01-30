export type Article = {
  content: string
  date: Date
  guid: string
  id: string
  link: string
  title: string
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
