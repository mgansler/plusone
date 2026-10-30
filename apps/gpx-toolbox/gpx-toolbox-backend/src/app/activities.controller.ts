import { Body, Controller, Delete, Get, Logger, Param, ParseUUIDPipe, Put, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { ActivitiesService } from './activities.service'
import { ActivityResponseDto, QueryActivityDto, UpdateActivityDto } from './dto/activity.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtPayload } from './jwt.strategy'

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  private readonly logger = new Logger(ActivitiesController.name)

  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ operationId: 'listAllActivities' })
  @ApiOkResponse({ description: 'List of activities', type: [ActivityResponseDto] })
  async findAll(@Req() req: Request & { user: JwtPayload }, @Query() query: QueryActivityDto) {
    return this.activitiesService.findAll(query, req.user.sub)
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getActivity' })
  @ApiOkResponse({ description: 'Activity details', type: ActivityResponseDto })
  async findOne(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.findOne(id, req.user.sub)
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateActivity' })
  @ApiOkResponse({ description: 'Activity updated successfully', type: ActivityResponseDto })
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, dto, req.user.sub)
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteActivity' })
  @ApiOkResponse({ description: 'Activity deleted successfully' })
  async remove(@Req() req: Request & { user: JwtPayload }, @Param('id', ParseUUIDPipe) id: string) {
    await this.activitiesService.remove(id, req.user.sub)
    return { deleted: true, id }
  }
}
