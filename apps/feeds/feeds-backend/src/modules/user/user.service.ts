import { Injectable } from '@nestjs/common'

import { PrismaService, User } from '@plusone/feeds-persistence'

import { UserResponseDto } from '../authentication/authentication.dto'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(): Promise<Array<UserResponseDto>> {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        password: false,
        username: true,
        isAdmin: true,
        email: true,
      },
    })
  }

  async getUser(id: User['id']): Promise<UserResponseDto> {
    return this.prismaService.user.findUniqueOrThrow({
      select: {
        id: true,
        password: false,
        username: true,
        isAdmin: true,
        email: true,
      },
      where: { id },
    })
  }

  async deleteUser(userId: User['id']): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.userArticle.deleteMany({ where: { userId } }),
      this.prismaService.userFeed.deleteMany({ where: { userId } }),
      this.prismaService.user.delete({ where: { id: userId } }),
    ])
  }
}
