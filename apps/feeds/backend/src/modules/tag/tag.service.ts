import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'

import { Feed, PrismaService, User, UserTag } from '@plusone/feeds-persistence'

import { TagInputDto } from './tag.dto'

@Injectable()
export class TagService {
  private logger = new Logger(TagService.name)

  constructor(private readonly prismaService: PrismaService) {}

  async getAll(userId: User['id']) {
    return this.prismaService.userTag.findMany({
      select: { id: true, name: true },
      where: { userId },
    })
  }

  async createTag(tagInput: TagInputDto, userId: User['id']) {
    try {
      return await this.prismaService.userTag.create({
        data: { name: tagInput.name, userId },
      })
    } catch (e) {
      if (e.code === 'P2002') {
        this.logger.warn(`This tag already exists: ${tagInput.name}`)
        throw new HttpException('You are already have this tag', HttpStatus.CONFLICT)
      }
      this.logger.error(e)
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteTag(id: UserTag['id'], userId: User['id']) {
    return this.prismaService.$transaction(async (tx) => {
      const tag = await tx.userTag.findUniqueOrThrow({ select: { userId: true }, where: { id } })
      if (tag.userId !== userId) {
        throw new HttpException('This tag does not belong to you.', HttpStatus.FORBIDDEN)
      }
      return await tx.userTag.delete({
        where: { id },
      })
    })
  }

  async getFeedTags(feedId: Feed['id'], userId: User['id']) {
    const feed = await this.prismaService.userFeed.findUnique({
      select: { tags: true },
      where: { userId_feedId: { userId, feedId } },
    })
    return feed.tags
  }

  async attachToFeed(feedId: Feed['id'], tagId: UserTag['id'], userId: User['id']) {
    await this.prismaService.userFeed.update({
      where: { userId_feedId: { userId, feedId } },
      data: {
        tags: { connect: { id: tagId } },
      },
    })
  }

  async detachFromFeed(feedId: Feed['id'], tagId: UserTag['id'], userId: User['id']) {
    await this.prismaService.userFeed.update({
      where: { userId_feedId: { userId, feedId } },
      data: {
        tags: { disconnect: { id: tagId } },
      },
    })
  }
}
