import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'

import { Feed, PrismaService, User, UserTag } from '@plusone/feeds-persistence'

import { TagInputDto, TagResponseDto } from './tag.dto'

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name)

  constructor(private readonly prismaService: PrismaService) {}

  async getAll(userId: User['id']): Promise<Array<TagResponseDto>> {
    return this.prismaService.userTag.findMany({
      select: { id: true, name: true, userId: true },
      where: { userId },
    })
  }

  async createTag(tagInput: TagInputDto, userId: User['id']): Promise<TagResponseDto> {
    try {
      return await this.prismaService.userTag.create({
        data: { name: tagInput.name, userId },
      })
    } catch (e) {
      if (e.code === 'P2002') {
        this.logger.warn(`This tag already exists: ${tagInput.name}.`)
        throw new HttpException('You already have this tag', HttpStatus.CONFLICT)
      }
      this.logger.error(e)
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteTag(id: UserTag['id'], userId: User['id']): Promise<void> {
    this.prismaService.$transaction(async (tx) => {
      const tag = await tx.userTag.findUniqueOrThrow({ select: { userId: true }, where: { id } })
      if (tag.userId !== userId) {
        throw new HttpException('This tag does not belong to you.', HttpStatus.FORBIDDEN)
      }
      tx.userTag.delete({ where: { id } })
    })
  }

  async getFeedTags(feedId: Feed['id'], userId: User['id']): Promise<Array<TagResponseDto>> {
    const feed = await this.prismaService.userFeed.findUniqueOrThrow({
      select: { tags: true },
      where: { userId_feedId: { userId, feedId } },
    })
    return feed.tags
  }

  async attachToFeed(feedId: Feed['id'], tagId: UserTag['id'], userId: User['id']): Promise<void> {
    await this.prismaService.userFeed.update({
      where: { userId_feedId: { userId, feedId } },
      data: {
        tags: { connect: { id: tagId } },
      },
    })
  }

  async detachFromFeed(feedId: Feed['id'], tagId: UserTag['id'], userId: User['id']): Promise<void> {
    await this.prismaService.userFeed.update({
      where: { userId_feedId: { userId, feedId } },
      data: {
        tags: { disconnect: { id: tagId } },
      },
    })
  }
}
