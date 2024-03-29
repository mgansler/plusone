import { ArticleBuilderFn } from './transformation'

export const fefeArticleBuilder: ArticleBuilderFn = async (item) => {
  return {
    content: item.content,
    guid: item.guid ?? item.id,
    link: item.link,
    title: item.title,
    date: new Date(),
  }
}
