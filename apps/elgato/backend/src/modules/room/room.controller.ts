import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common'
import { ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { RoomCreateDto } from './dto/room-create.dto'
import { RoomListResponseDto } from './dto/room-list-response.dto'
import { RoomResponseDto } from './dto/room-response.dto'
import { RoomStateInputDto } from './dto/room-state-input.dto'
import { RoomWithDevicesResponseDto } from './dto/room-with-response.dto'
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

  @ApiOperation({ operationId: 'room-details' })
  @ApiOkResponse({
    description: 'Returns a room with all devices and their current state in it.',
    type: RoomWithDevicesResponseDto,
  })
  @Get('/room/:roomId')
  async getRoom(@Param('roomId', ParseIntPipe) roomId: number): Promise<RoomWithDevicesResponseDto> {
    return this.roomService.getRoom(roomId)
  }

  @ApiOperation({ operationId: 'control-room-state' })
  @ApiBody({ description: 'Switches all devices in that room on or off.', type: RoomStateInputDto })
  @ApiNoContentResponse({ description: 'All devices have been switched on or off.' })
  @Put('/room/:roomId/state')
  async controlRoomState(@Param('roomId', ParseIntPipe) roomId: number, @Body() roomStateInputDto: RoomStateInputDto) {
    return await this.roomService.setRoomState(roomId, roomStateInputDto.desiredPowerState)
  }
}
