import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { ImportService } from './import.service'
import { ImportResultDto, StravaRouteSummaryDto } from './dto/import.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'
import { StravaService } from './strava.service'
import { AuthService } from './auth.service'

@ApiTags('import')
@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly stravaService: StravaService,
    private readonly authService: AuthService,
  ) {}

  private async getStravaToken(req: Request & { user: JwtPayload }): Promise<string> {
    // Guarantees a valid token: refreshes transparently if the stored one is expired.
    return this.authService.getValidAccessToken(req.user.sub)
  }

  @Post('strava/routes')
  @ApiOperation({ operationId: 'importStravaRoutes' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'force', required: false, description: 'Force re-import' })
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importStravaRoutes(@Req() req: Request & { user: JwtPayload }, @Query('force') force: string) {
    const accessToken = await this.getStravaToken(req)
    // Fetch athlete ID first (required by importStravaRoutes)
    const athlete = (await this.stravaService.getAthlete(accessToken)) as { id?: number }
    if (!athlete?.id) throw new Error('Could not retrieve athlete ID from Strava')
    return this.importService.importStravaRoutes(accessToken, req.user.sub, athlete.id!, force === 'true')
  }

  @Post('strava/activity')
  @ApiOperation({ operationId: 'importStravaActivity' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importStravaActivity(
    @Req() req: Request & { user: JwtPayload },
    @Query('activityId') activityId: string,
    @Query('autoMatch') autoMatch: string,
  ) {
    const accessToken = await this.getStravaToken(req)
    return this.importService.importStravaActivity(accessToken, req.user.sub, activityId, autoMatch !== 'false')
  }

  @Post('strava/all-activities')
  @ApiOperation({ operationId: 'importAllStravaActivities' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importAllActivities(@Req() req: Request & { user: JwtPayload }, @Query('limit') limit: string) {
    const accessToken = await this.getStravaToken(req)
    const limitNum = parseInt(limit) || 100
    return this.importService.importAllActivities(accessToken, req.user.sub, limitNum)
  }

  @Get('strava/routes')
  @ApiOperation({ operationId: 'listStravaRoutes' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [StravaRouteSummaryDto], description: 'List of Strava routes' })
  async listStravaRoutes(@Req() req: Request & { user: JwtPayload }) {
    const accessToken = await this.getStravaToken(req)
    const athlete = (await this.stravaService.getAthlete(accessToken)) as { id?: number }
    if (!athlete?.id) throw new Error('Could not retrieve athlete ID from Strava')
    return this.importService.listStravaRoutes(accessToken, req.user.sub, athlete.id!)
  }

  @Post('strava/routes/:stravaRouteId')
  @ApiOperation({ operationId: 'importSingleStravaRoute' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ImportResultDto, description: 'Import result for single route' })
  async importSingleStravaRoute(
    @Req() req: Request & { user: JwtPayload },
    @Param('stravaRouteId') stravaRouteId: string,
  ) {
    const accessToken = await this.getStravaToken(req)
    const result = await this.importService.importSingleStravaRoute(accessToken, req.user.sub, stravaRouteId)
    return {
      imported: result.imported ? 1 : 0,
      matched: result.matched ? 1 : 0,
      newRoutes: result.newRoutes ? 1 : 0,
    }
  }
}
