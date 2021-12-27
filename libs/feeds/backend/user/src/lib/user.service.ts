import { Injectable } from '@nestjs/common'

import type { PrismaService } from '@plusone/feeds/backend/persistence'

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
