import { Schema } from 'mongoose'
import { Item } from 'rss-parser'

export const ArticleSchema = new Schema({
  content: String,
  contentBody: String,
  guid: String,
  link: String,
  title: String,
})

export interface Article extends Document {
  readonly content: Item['content']
  readonly contentBody: string
  readonly guid: Item['guid']
  readonly link: Item['link']
  readonly title: Item['title']
}
