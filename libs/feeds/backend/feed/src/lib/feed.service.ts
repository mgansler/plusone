import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'

import { FeedDocument } from './feed.schema'
import { FEED_MODEL } from './feed.constants'
import { FeedDto } from './feed.dto'

@Injectable()
export class FeedService {
  constructor(@Inject(FEED_MODEL) private feedModel: Model<FeedDocument>) {}

  async create(feedDto: FeedDto): Promise<FeedDocument> {
    const createdFeed = new this.feedModel(feedDto)
    return createdFeed.save()
  }

  async findAll(): Promise<FeedDocument[]> {
    return this.feedModel.find().exec()
  }
}
