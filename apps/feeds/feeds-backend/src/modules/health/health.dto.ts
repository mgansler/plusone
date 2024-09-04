import { ApiProperty } from '@nestjs/swagger'
import { HealthCheckResult, HealthCheckStatus, HealthIndicatorResult } from '@nestjs/terminus'

export class HealthCheckResultDto implements HealthCheckResult {
  @ApiProperty()
  details: HealthIndicatorResult

  @ApiProperty()
  error?: HealthIndicatorResult

  @ApiProperty()
  info?: HealthIndicatorResult

  @ApiProperty()
  status: HealthCheckStatus
}
