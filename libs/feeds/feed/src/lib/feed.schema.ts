import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema()
export class Feed {
  @Prop()
  title: string

  @Prop()
  feedUrl: string
}

export const FeedSchema = SchemaFactory.createForClass(Feed)
export type FeedDocument = Feed & Document
