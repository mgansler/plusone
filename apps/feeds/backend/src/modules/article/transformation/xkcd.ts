import { ArticleBuilderFn } from './transformation'

export const xkcdArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: '',
    contentBody: item.summary,
    guid: item.id,
    link: item.link,
    title: item.title,
    date: new Date(item.isoDate),
  }
}
