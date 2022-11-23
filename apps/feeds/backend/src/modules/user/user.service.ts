import { Injectable } from '@nestjs/common'

import { PrismaService, User } from '@plusone/feeds-persistence'

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getAll() {
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

  async deleteUser(userId: User['id']): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.userArticle.deleteMany({ where: { userId } }),
      this.prismaService.userFeed.deleteMany({ where: { userId } }),
      this.prismaService.user.delete({ where: { id: userId } }),
    ])
  }
}
