import { ArticleBuilderFn } from './transformation'

export const xkcdArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item.summary,
    guid: item.guid,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}
