import { Controller, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { ImportService } from './import.service'
import { ImportResultDto } from './dto/import.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'
import { StravaService } from './strava.service'

@ApiTags('import')
@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly stravaService: StravaService,
  ) {}

  @Post('strava/routes')
  @ApiOperation({ operationId: 'importStravaRoutes' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'force', required: false, description: 'Force re-import' })
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importStravaRoutes(@Req() req: Request & { user: JwtPayload }, @Query('force') force: string) {
    const accessToken = req.headers['authorization']!.replace('Bearer ', '')
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
    return this.importService.importStravaActivity(
      req.headers['authorization']!.replace('Bearer ', ''),
      req.user.sub,
      activityId,
      autoMatch !== 'false',
    )
  }

  @Post('strava/all-activities')
  @ApiOperation({ operationId: 'importAllStravaActivities' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importAllActivities(@Req() req: Request & { user: JwtPayload }, @Query('limit') limit: string) {
    const limitNum = parseInt(limit) || 100
    return this.importService.importAllActivities(
      req.headers['authorization']!.replace('Bearer ', ''),
      req.user.sub,
      limitNum,
    )
  }
}
