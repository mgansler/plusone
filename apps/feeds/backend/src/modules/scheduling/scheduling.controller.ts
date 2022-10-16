import { Controller, Post, UseGuards } from '@nestjs/common'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { Roles } from '../authentication/roles.decorator'
import { RolesGuard } from '../authentication/roles.guard'

import { SchedulingService } from './scheduling.service'

@Controller('scheduling')
@UseGuards(JwtAccessTokenGuard, RolesGuard)
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('now')
  @Roles('admin')
  async fetchNow() {
    this.schedulingService.handleCron()
  }
}
