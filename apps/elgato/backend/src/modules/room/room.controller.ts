import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { RoomCreateDto, RoomListResponseDto, RoomResponseDto, RoomStateInputDto } from './room.dto'
import { RoomService } from './room.service'

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({ operationId: 'room-list' })
  @ApiOkResponse({ description: 'List of rooms.', type: RoomListResponseDto })
  @Get('/rooms')
  async getRooms(): Promise<RoomListResponseDto> {
    const rooms = await this.roomService.getAllRooms()
    return { rooms }
  }

  @ApiOperation({ operationId: 'create-room' })
  @ApiBody({ description: 'Information about the new room.', type: RoomCreateDto })
  @ApiCreatedResponse({ description: 'The newly created room.', type: RoomResponseDto })
  @Post('/room')
  async createRoom(@Body() roomCreateDto: RoomCreateDto): Promise<RoomResponseDto> {
    return await this.roomService.createRoom(roomCreateDto)
  }

  @ApiOperation({ operationId: 'todo-set-room' })
  @ApiBody({ description: 'Switches all devices in that room on or off.', type: RoomStateInputDto })
  @ApiNoContentResponse({ description: 'All devices have been switched on or off.' })
  @Put('/room/:id/state')
  async setRoomState(@Param('id', ParseIntPipe) id: number, @Body() roomStateInputDto: RoomStateInputDto) {
    return await this.roomService.setRoomState(id, roomStateInputDto.desiredPowerState)
  }
}
