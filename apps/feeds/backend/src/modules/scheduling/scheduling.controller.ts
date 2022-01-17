import { Controller, Post, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '../authentication/jwt-auth.guard'
import { Roles } from '../authentication/roles.decorator'
import { RolesGuard } from '../authentication/roles.guard'

import { SchedulingService } from './scheduling.service'

@Controller('scheduling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('now')
  @Roles('admin')
  async fetchNow() {
    this.schedulingService.handleCron()
  }
}
