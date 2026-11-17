import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Res } from '@nestjs/common'
import { ApiCookieAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'

import { AccessPasswordService } from './access-password.service'
import { AdminOnly } from './auth/auth.decorators'
import { BackupService } from './backup.service'
import { CareNeedCategoryService } from './care-need-category.service'
import { SESSION_COOKIE } from './auth/session-cookie'
import {
  AccessPasswordDto,
  AccessPasswordWithSecretDto,
  CreateAccessPasswordDto,
  RotateAccessPasswordDto,
  UpdateAccessPasswordDto,
} from './dto/access-password.dto'
import { CareNeedCategoryDto, CreateCareNeedCategoryDto, UpdateCareNeedCategoryDto } from './dto/care-need-category.dto'
import { BackupInfoDto } from './dto/backup.dto'
import { SweepSettingsDto } from './dto/sweep-settings.dto'
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
    private readonly backupService: BackupService,
    private readonly careNeedCategoryService: CareNeedCategoryService,
  ) {}

  @Get('sweep-settings')
  @ApiOperation({ operationId: 'getSweepSettings', description: 'Traffic light thresholds for all trails' })
  @ApiOkResponse({ type: SweepSettingsDto })
  getSweepSettings() {
    return this.trailService.getSweepSettings()
  }

  @Put('sweep-settings')
  @ApiOperation({
    operationId: 'updateSweepSettings',
    description: 'Changes the traffic light for all trails that have no thresholds of their own',
  })
  @ApiOkResponse({ type: SweepSettingsDto })
  updateSweepSettings(@Body() body: SweepSettingsDto) {
    return this.trailService.updateSweepSettings(body)
  }

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

  @Get('backups')
  @ApiOperation({ operationId: 'listBackups', description: 'List all available database backups' })
  @ApiOkResponse({ type: [BackupInfoDto] })
  listBackups() {
    return this.backupService.listBackups()
  }

  @Post('backup')
  @ApiOperation({ operationId: 'createBackup', description: 'Create a manual database backup using VACUUM INTO' })
  @ApiOkResponse({ type: BackupInfoDto })
  createBackup() {
    return this.backupService.createBackup()
  }

  @Get('backups/:fileName/download')
  @ApiOperation({ operationId: 'downloadBackup', description: 'Download a specific backup file' })
  downloadBackup(@Param('fileName') fileName: string, @Res() res: Response) {
    this.backupService.downloadBackup(fileName).then(({ buffer, fileName }) => {
      res.setHeader('Content-Type', 'application/octet-stream')
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
      res.send(buffer)
    })
  }

  @Get('care-need-categories')
  @ApiOperation({ operationId: 'getCareNeedCategories', description: 'List active care need categories' })
  @ApiOkResponse({ type: [CareNeedCategoryDto] })
  getCareNeedCategories() {
    return this.careNeedCategoryService.list()
  }

  @Post('care-need-categories')
  @ApiOperation({ operationId: 'createCareNeedCategory' })
  @ApiOkResponse({ type: CareNeedCategoryDto })
  createCareNeedCategory(@Body() body: CreateCareNeedCategoryDto) {
    return this.careNeedCategoryService.create(body)
  }

  @Put('care-need-categories/:id')
  @ApiOperation({ operationId: 'updateCareNeedCategory' })
  @ApiOkResponse({ type: CareNeedCategoryDto })
  updateCareNeedCategory(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCareNeedCategoryDto) {
    return this.careNeedCategoryService.update(id, body)
  }

  @Delete('care-need-categories/:id')
  @HttpCode(204)
  @ApiOperation({
    operationId: 'deleteCareNeedCategory',
    description: 'Soft deletes the category (only if not used by any care need)',
  })
  @ApiNoContentResponse()
  deleteCareNeedCategory(@Param('id', ParseIntPipe) id: number) {
    return this.careNeedCategoryService.softDelete(id)
  }
}
