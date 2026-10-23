import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'

import { ImportService } from './import.service'
import { ImportResultDto } from './dto/import.dto'

type JwtPayload = { sub: string }

@ApiTags('import')
@Controller('import')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('strava/routes')
  @ApiOperation({ operationId: 'importStravaRoutes' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'force', required: false, description: 'Force re-import' })
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importStravaRoutes(@Req() req: Request, @Query('force') force: string) {
    const auth = req.headers['authorization']?.replace('Bearer ', '')
    if (!auth) throw new Error('No access token provided')

    const { sub: userId } = this.jwtService.decode(auth) as JwtPayload
    if (!userId) throw new Error('Invalid token')

    return this.importService.importStravaRoutes(auth, userId, force === 'true')
  }

  @Post('strava/activity')
  @ApiOperation({ operationId: 'importStravaActivity' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importStravaActivity(
    @Req() req: Request,
    @Query('activityId') activityId: string,
    @Query('autoMatch') autoMatch: string,
  ) {
    const auth = req.headers['authorization']?.replace('Bearer ', '')
    if (!auth) throw new Error('No access token provided')

    const { sub: userId } = this.jwtService.decode(auth) as JwtPayload
    if (!userId) throw new Error('Invalid token')

    return this.importService.importStravaActivity(auth, userId, activityId, autoMatch !== 'false')
  }

  @Post('strava/all-activities')
  @ApiOperation({ operationId: 'importAllStravaActivities' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Import results', type: ImportResultDto })
  async importAllActivities(@Req() req: Request, @Query('limit') limit: string) {
    const auth = req.headers['authorization']?.replace('Bearer ', '')
    if (!auth) throw new Error('No access token provided')

    const { sub: userId } = this.jwtService.decode(auth) as JwtPayload
    if (!userId) throw new Error('Invalid token')

    const limitNum = parseInt(limit) || 100
    return this.importService.importAllActivities(auth, userId, limitNum)
  }
}
