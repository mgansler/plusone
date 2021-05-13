import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'

import { Feed } from './feed.schema'
import { FEED_MODEL } from './feed.constants'
import { FeedDto } from './feed.dto'

@Injectable()
export class FeedService {
  constructor(@Inject(FEED_MODEL) private feedModel: Model<Feed>) {}

  async create(feedDto: FeedDto): Promise<Feed> {
    const createdFeed = new this.feedModel(feedDto)
    return createdFeed.save()
  }

  async findAll(): Promise<Feed[]> {
    return this.feedModel.find().exec()
  }
}
