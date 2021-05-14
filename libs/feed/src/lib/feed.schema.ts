import { Document, Schema } from 'mongoose'

export const FeedSchema = new Schema({
  title: String,
  feedUrl: String,
})

export interface Feed extends Document {
  readonly title: string
  readonly feedUrl: string
}
