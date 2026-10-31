import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { AccessPasswordService } from './access-password.service'
import { AdminOnly } from './auth/auth.decorators'
import { SESSION_COOKIE } from './auth/session-cookie'
import {
  AccessPasswordDto,
  AccessPasswordWithSecretDto,
  CreateAccessPasswordDto,
  RotateAccessPasswordDto,
  UpdateAccessPasswordDto,
} from './dto/access-password.dto'
import { CreateTrailDto, TrailAreaInputDto, TrailAreaResponseDto, TrailDto, UpdateTrailDto } from './dto/trail.dto'
import { TrailService } from './trail.service'

@ApiTags('admin')
@ApiCookieAuth(SESSION_COOKIE)
@AdminOnly()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly trailService: TrailService,
    private readonly accessPasswordService: AccessPasswordService,
  ) {}

  @Post('trail-areas')
  @ApiOperation({ operationId: 'createTrailArea' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  createTrailArea(@Body() body: TrailAreaInputDto) {
    return this.trailService.createTrailArea(body)
  }

  @Put('trail-areas/:trailAreaId')
  @ApiOperation({ operationId: 'updateTrailArea' })
  @ApiOkResponse({ type: TrailAreaResponseDto })
  updateTrailArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number, @Body() body: TrailAreaInputDto) {
    return this.trailService.updateTrailArea(trailAreaId, body)
  }

  @Delete('trail-areas/:trailAreaId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteTrailArea', description: 'Deletes the area including its trails and care log' })
  @ApiNoContentResponse()
  deleteTrailArea(@Param('trailAreaId', ParseIntPipe) trailAreaId: number) {
    return this.trailService.deleteTrailArea(trailAreaId)
  }

  @Post('trail-areas/:trailAreaId/trails')
  @ApiOperation({ operationId: 'createTrail' })
  @ApiOkResponse({ type: TrailDto })
  createTrail(@Param('trailAreaId', ParseIntPipe) trailAreaId: number, @Body() body: CreateTrailDto) {
    return this.trailService.createTrail(trailAreaId, body)
  }

  @Put('trails/:trailId')
  @ApiOperation({ operationId: 'updateTrail' })
  @ApiOkResponse({ type: TrailDto })
  updateTrail(@Param('trailId', ParseIntPipe) trailId: number, @Body() body: UpdateTrailDto) {
    return this.trailService.updateTrail(trailId, body)
  }

  @Delete('trails/:trailId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteTrail', description: 'Deletes the trail including its care log' })
  @ApiNoContentResponse()
  deleteTrail(@Param('trailId', ParseIntPipe) trailId: number) {
    return this.trailService.deleteTrail(trailId)
  }

  @Get('access-passwords')
  @ApiOperation({ operationId: 'getAccessPasswords' })
  @ApiOkResponse({ type: [AccessPasswordDto] })
  getAccessPasswords() {
    return this.accessPasswordService.list()
  }

  @Post('access-passwords')
  @ApiOperation({ operationId: 'createAccessPassword' })
  @ApiOkResponse({ type: AccessPasswordWithSecretDto })
  createAccessPassword(@Body() body: CreateAccessPasswordDto) {
    return this.accessPasswordService.create(body)
  }

  @Put('access-passwords/:accessPasswordId')
  @ApiOperation({ operationId: 'updateAccessPassword' })
  @ApiOkResponse({ type: AccessPasswordDto })
  updateAccessPassword(
    @Param('accessPasswordId', ParseIntPipe) accessPasswordId: number,
    @Body() body: UpdateAccessPasswordDto,
  ) {
    return this.accessPasswordService.updateLabel(accessPasswordId, body)
  }

  @Post('access-passwords/:accessPasswordId/rotate')
  @HttpCode(200)
  @ApiOperation({ operationId: 'rotateAccessPassword', description: 'New password, logs out all its devices' })
  @ApiOkResponse({ type: AccessPasswordWithSecretDto })
  rotateAccessPassword(
    @Param('accessPasswordId', ParseIntPipe) accessPasswordId: number,
    @Body() body: RotateAccessPasswordDto,
  ) {
    return this.accessPasswordService.rotate(accessPasswordId, body)
  }

  @Delete('access-passwords/:accessPasswordId')
  @HttpCode(204)
  @ApiOperation({ operationId: 'deleteAccessPassword', description: 'Deletes the password and logs out its devices' })
  @ApiNoContentResponse()
  deleteAccessPassword(@Param('accessPasswordId', ParseIntPipe) accessPasswordId: number) {
    return this.accessPasswordService.delete(accessPasswordId)
  }
}
