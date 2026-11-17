import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common'
import { ApiBody, ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CareTeamOrAdmin } from './auth/auth.decorators'
import { SESSION_COOKIE } from './auth/session-cookie'
import { CareNeedCategoryService } from './care-need-category.service'
import { CareNeedService } from './care-need.service'
import { CareNeedCategoryDto } from './dto/care-need-category.dto'
import { CareNeedDto, CreateCareNeedDto, UpdateCareNeedDto } from './dto/care-need.dto'

@ApiTags('care-needs')
@ApiCookieAuth(SESSION_COOKIE)
@Controller()
export class CareNeedController {
  constructor(
    private readonly careNeedService: CareNeedService,
    private readonly careNeedCategoryService: CareNeedCategoryService,
  ) {}

  @Get('care-need-categories')
  @ApiOperation({ operationId: 'getCareNeedCategories', description: 'List active care need categories' })
  @ApiOkResponse({ type: [CareNeedCategoryDto] })
  getCareNeedCategories(): Promise<Array<CareNeedCategoryDto>> {
    return this.careNeedCategoryService.list()
  }

  @Get('care-needs/:trailId')
  @ApiOperation({ operationId: 'getCareNeeds', description: 'All care needs for a trail' })
  @ApiOkResponse({ type: [CareNeedDto] })
  @CareTeamOrAdmin()
  getCareNeeds(@Param('trailId', ParseIntPipe) trailId: number) {
    return this.careNeedService.getCareNeeds(trailId)
  }

  @Post('care-needs/:trailId')
  @ApiOperation({ operationId: 'createCareNeed', description: 'Add a care need to a trail' })
  @ApiOkResponse({ type: CareNeedDto })
  @ApiBody({ type: CreateCareNeedDto })
  @CareTeamOrAdmin()
  createCareNeed(@Param('trailId', ParseIntPipe) trailId: number, @Body() body: CreateCareNeedDto) {
    return this.careNeedService.createCareNeed(trailId, body)
  }

  @Patch('care-needs/:id')
  @ApiOperation({ operationId: 'updateCareNeed', description: 'Update a care need' })
  @ApiOkResponse({ type: CareNeedDto })
  @ApiBody({ type: UpdateCareNeedDto })
  @CareTeamOrAdmin()
  updateCareNeed(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCareNeedDto) {
    return this.careNeedService.updateCareNeed(id, body)
  }

  @Delete('care-needs/:id')
  @ApiOperation({ operationId: 'deleteCareNeed', description: 'Delete a care need' })
  @CareTeamOrAdmin()
  deleteCareNeed(@Param('id', ParseIntPipe) id: number) {
    return this.careNeedService.deleteCareNeed(id)
  }
}
