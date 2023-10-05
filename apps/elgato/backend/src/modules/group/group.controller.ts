import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { GroupCreateDto } from './dto/group-create.dto'
import { GroupListResponseDto } from './dto/group-list-response.dto'
import { GroupResponseDto } from './dto/group-response.dto'
import { GroupStateInputDto } from './dto/group-state-input.dto'
import { GroupWithDevicesResponseDto } from './dto/group-with-devices-response.dto'
import { GroupService } from './group.service'

@Controller('/group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({ operationId: 'create-group' })
  @ApiBody({ description: 'Information about the new group.', type: GroupCreateDto })
  @ApiCreatedResponse({ description: 'The newly created group.', type: GroupResponseDto })
  @Post('')
  async createGroup(@Body() groupCreateDto: GroupCreateDto): Promise<GroupResponseDto> {
    return await this.groupService.createGroup(groupCreateDto)
  }

  @ApiOperation({ operationId: 'group-list' })
  @ApiOkResponse({ description: 'List of groups.', type: GroupListResponseDto })
  @Get('/all')
  async getGroups(): Promise<GroupListResponseDto> {
    const groups = await this.groupService.getAllGroups()
    return { groups }
  }

  @ApiOperation({ operationId: 'group-details' })
  @ApiOkResponse({
    description: 'Returns a group with all devices and their current state in it.',
    type: GroupWithDevicesResponseDto,
  })
  @Get('/:groupId')
  async getGroup(@Param('groupId', ParseIntPipe) groupId: number): Promise<GroupWithDevicesResponseDto> {
    return this.groupService.getGroup(groupId)
  }

  @ApiOperation({ operationId: 'control-group-state' })
  @ApiBody({ description: 'Switches all devices in that group on or off.', type: GroupStateInputDto })
  @ApiNoContentResponse({ description: 'All devices have been switched on or off.' })
  @Put('/:groupId/state')
  async controlGroupState(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() groupStateInputDto: GroupStateInputDto,
  ) {
    return await this.groupService.setGroupState(groupId, groupStateInputDto.desiredPowerState)
  }
}
