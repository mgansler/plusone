import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { AdminOnly, CurrentSession } from './auth/auth.decorators'
import { SESSION_COOKIE } from './auth/session-cookie'
import { ActiveSession } from './auth/session.service'
import { CareService } from './care.service'
import { CareEntryDto, CreateCareEntryDto, UpdateCareEntryDto } from './dto/care-entry.dto'

@ApiTags('care')
@ApiCookieAuth(SESSION_COOKIE)
@Controller()
export class CareController {
  constructor(private readonly careService: CareService) {}

  @Get('trails/:trailId/care-entries')
  @ApiOperation({ operationId: 'getCareEntries', description: 'Care log of a trail, newest first' })
  @ApiOkResponse({ type: [CareEntryDto] })
  getCareEntries(@Param('trailId', ParseIntPipe) trailId: number, @CurrentSession() session: ActiveSession) {
    return this.careService.listEntries(trailId, session)
  }

  @Post('trails/:trailId/care-entries')
  @ApiOperation({ operationId: 'createCareEntry' })
  @ApiOkResponse({ type: CareEntryDto })
  createCareEntry(
    @Param('trailId', ParseIntPipe) trailId: number,
    @Body() body: CreateCareEntryDto,
    @CurrentSession() session: ActiveSession,
  ) {
    return this.careService.createEntry(trailId, body, session)
  }

  @AdminOnly()
  @Put('care-entries/:entryId')
  @ApiOperation({ operationId: 'updateCareEntry' })
  @ApiOkResponse({ type: CareEntryDto })
  updateCareEntry(
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body() body: UpdateCareEntryDto,
    @CurrentSession() session: ActiveSession,
  ) {
    return this.careService.updateEntry(entryId, body, session)
  }

  @Delete('care-entries/:entryId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteCareEntry', description: 'Undo for the creator, delete for admins' })
  @ApiNoContentResponse()
  deleteCareEntry(@Param('entryId', ParseIntPipe) entryId: number, @CurrentSession() session: ActiveSession) {
    return this.careService.deleteEntry(entryId, session)
  }
}
