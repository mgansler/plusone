import { Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { Role, Roles, RolesGuard } from '../authentication/roles.guard'

import { SchedulingService } from './scheduling.service'

@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('scheduling')
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Roles(Role.Admin)
  @ApiOperation({ operationId: 'force-fetching' })
  @ApiCreatedResponse({ description: 'Fetching all feeds has been triggered.' })
  @Post('now')
  async fetchNow() {
    this.schedulingService.handleCron()
  }
}
