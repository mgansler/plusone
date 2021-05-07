import { Document, Schema } from 'mongoose'

export const FeedSchema = new Schema({
  title: String,
  uri: String,
})

export interface Feed extends Document {
  readonly title: string
  readonly uri: string
}
