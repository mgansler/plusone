import { Injectable, Logger } from '@nestjs/common'

import { PrismaService, Room } from '@plusone/elgato-persistence'

import { DeviceService } from '../device/device.service'

import { DevicePowerState, RoomCreateDto } from './room.dto'

@Injectable()
export class RoomService {
  private logger = new Logger(RoomService.name)

  constructor(private readonly prismaService: PrismaService, private readonly deviceService: DeviceService) {}

  async getAllRooms() {
    return this.prismaService.room.findMany()
  }

  async createRoom(roomCreateDto: RoomCreateDto) {
    return this.prismaService.room.create({
      data: roomCreateDto,
    })
  }

  async setRoomState(id: Room['id'], targetState: DevicePowerState) {
    await this.prismaService.room.findUniqueOrThrow({ where: { id } })
    return this.deviceService.setRoomState(id, targetState)
  }
}
