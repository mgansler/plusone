import { Injectable } from '@nestjs/common'

import { PrismaService } from '@plusone/feeds-persistence'

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
}
