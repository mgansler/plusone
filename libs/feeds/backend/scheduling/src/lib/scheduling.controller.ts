import { Controller, Post, UseGuards } from '@nestjs/common'

import { JwtAuthGuard, Roles, RolesGuard } from '@plusone/feeds/backend/authentication'

import type { SchedulingService } from './scheduling.service'

@Controller('schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('now')
  @Roles('admin')
  async fetchNow() {
    this.schedulingService.handleCron()
  }
}
