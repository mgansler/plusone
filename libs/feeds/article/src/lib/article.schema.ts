import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Item } from 'rss-parser'

@Schema()
export class Article {
  @Prop({ type: String })
  content: Item['content']

  @Prop()
  contentBody: string

  @Prop({ type: String })
  guid: Item['guid']

  @Prop({ type: String })
  link: Item['link']

  @Prop({ type: String })
  title: Item['title']
}

export const ArticleSchema = SchemaFactory.createForClass(Article)
export type ArticleDocument = Article & Document
