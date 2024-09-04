import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'

import { HealthCheckResultDto } from './health.dto'

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  @ApiOkResponse({ description: 'Health status of the application.', type: HealthCheckResultDto })
  async getHealthStatus(): Promise<HealthCheckResultDto> {
    return this.health.check([])
  }
}
