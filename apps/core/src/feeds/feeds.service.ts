import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'

import { FeedDto } from '../dto/feed.dto'

import { Feed } from './feed.schema'

@Injectable()
export class FeedsService {
  constructor(@Inject('FEED_MODEL') private feedModel: Model<Feed>) {}

  async create(feedDto: FeedDto): Promise<Feed> {
    const createdFeed = new this.feedModel(feedDto)
    return createdFeed.save()
  }

  async findAll(): Promise<Feed[]> {
    return this.feedModel.find().exec()
  }
}
