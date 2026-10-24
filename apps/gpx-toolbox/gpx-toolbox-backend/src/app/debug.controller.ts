import { Controller, Get, Logger, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { PrismaService } from '@plusone/gpx-toolbox-persistence'

import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'
import { StravaService } from './strava.service'

/**
 * Debug endpoint to make direct requests to the Strava API.
 * Returns the raw JSON response for inspection.
 *
 * Pre-configured endpoints:
 *   /athlete                          — current athlete profile
 *   /athletes/me/stats                — current athlete stats (requires premium)
 *   /athletes/{id}/stats              — use /athletes/me/stats or replace {id}
 *   /routes                           — athlete's routes
 *   /activities                       — athlete's activities
 */
@ApiTags('debug')
@Controller('debug')
@UseGuards(JwtAuthGuard)
export class DebugController {
  private readonly logger = new Logger(DebugController.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly stravaService: StravaService,
  ) {}

  @Get('strava')
  @ApiOperation({ operationId: 'debugStravaRequest' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'endpoint',
    required: true,
    description: 'Strava API endpoint (e.g. /athlete, /athletes/me/stats, /routes)',
  })
  async stravaRequest(@Req() req: Request & { user: JwtPayload }, @Query('endpoint') endpoint: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { accessToken: true, stravaId: true },
    })

    if (!user?.accessToken) throw new UnauthorizedException('No Strava access token')

    // Replace {id} and {athlete_id} with the authenticated user's Strava ID
    const resolvedEndpoint = endpoint.replace('{id}', user.stravaId).replace('{athlete_id}', user.stravaId)
    console.log({ resolvedEndpoint, endpoint })

    this.logger.log(`Debug Strava request: ${resolvedEndpoint}`)

    try {
      const response = await this.stravaService.fetchStrava(resolvedEndpoint, user.accessToken)
      const data = await response.json()

      if (!response.ok) {
        return {
          status: response.status,
          statusText: response.statusText,
          error: data,
        }
      }

      return {
        status: response.status,
        data,
      }
    } catch (error) {
      return {
        status: 0,
        error: { message: error.message },
      }
    }
  }
}
