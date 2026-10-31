import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CurrentSession } from './auth/auth.decorators'
import { SESSION_COOKIE } from './auth/session-cookie'
import { ActiveSession } from './auth/session.service'
import { TrailAreaDto, TrailDto } from './dto/trail.dto'
import { TrailService } from './trail.service'

@ApiTags('trails')
@ApiCookieAuth(SESSION_COOKIE)
@Controller()
export class TrailController {
  constructor(private readonly trailService: TrailService) {}

  @Get('trail-areas')
  @ApiOperation({ operationId: 'getTrailAreas', description: 'All trail areas with their trails and sweep status' })
  @ApiOkResponse({ type: [TrailAreaDto] })
  getTrailAreas(@CurrentSession() session: ActiveSession) {
    return this.trailService.listTrailAreas(session)
  }

  @Get('trails/:trailId')
  @ApiOperation({ operationId: 'getTrail' })
  @ApiOkResponse({ type: TrailDto })
  getTrail(@Param('trailId', ParseIntPipe) trailId: number, @CurrentSession() session: ActiveSession) {
    return this.trailService.getTrail(trailId, session)
  }
}
