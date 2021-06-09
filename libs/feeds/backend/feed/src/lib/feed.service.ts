import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { Feed } from '@plusone/feeds/backend/database'

import { FeedDto } from './feed.dto'

@Injectable()
export class FeedService {
  constructor(@InjectRepository(Feed) private feedRepository: Repository<Feed>) {}

  async create(feedDto: FeedDto): Promise<Feed> {
    const createdFeed = this.feedRepository.create(feedDto)
    return this.feedRepository.save(createdFeed)
  }

  async findAll(): Promise<Feed[]> {
    return this.feedRepository.find()
  }
}
