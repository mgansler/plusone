import { Controller, Post, UseGuards } from '@nestjs/common'
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { Roles } from '../authentication/roles.decorator'
import { RolesGuard } from '../authentication/roles.guard'

import { SchedulingService } from './scheduling.service'

@Controller('scheduling')
@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiTags('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Post('now')
  @Roles('admin')
  @ApiCreatedResponse({ description: 'Fetching all feeds has been triggered.' })
  async fetchNow() {
    this.schedulingService.handleCron()
  }
}
