import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { JwtAccessTokenGuard } from '../authentication/jwt.strategy'
import { Role, Roles, RolesGuard } from '../authentication/roles.guard'

import { AdminStatsResponseDto } from './admin-stats.dto'
import { AdminService } from './admin.service'

@UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth()
@Roles(Role.Admin)
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ operationId: 'getAdminStats' })
  @ApiOkResponse({ description: 'Statistic about the current data.', type: AdminStatsResponseDto })
  @Get('stats')
  getStats(): Promise<AdminStatsResponseDto> {
    return this.adminService.getStats()
  }
}
