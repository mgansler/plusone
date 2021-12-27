import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable } from '@nestjs/common'

import { PrismaClient } from './client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
