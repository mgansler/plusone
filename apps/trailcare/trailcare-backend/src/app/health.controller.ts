import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'

import { Public } from './auth/auth.decorators'
import { HealthCheckResultDto } from './dto/health.dto'

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ operationId: 'getHealthStatus' })
  @ApiOkResponse({ description: 'Health status of the application.', type: HealthCheckResultDto })
  async getHealthStatus() {
    return this.health.check([])
  }
}
