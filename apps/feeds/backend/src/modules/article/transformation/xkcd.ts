import { ArticleBuilderFn } from './transformation'

export const xkcdAtomArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item.summary,
    guid: item.id,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}

export const xkcdRssArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item.content,
    guid: item.guid,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}
