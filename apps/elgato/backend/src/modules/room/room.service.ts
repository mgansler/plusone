import { Injectable, Logger } from '@nestjs/common'

import { PrismaService, Room } from '@plusone/elgato-persistence'

import { DevicePowerState } from '../device/device-power-state'
import { DeviceService } from '../device/device.service'
import { DeviceDetailsResponseDto } from '../device/dto/device-details-response.dto'

import { RoomCreateDto } from './dto/room-create.dto'
import { RoomResponseDto } from './dto/room-response.dto'
import { RoomWithDevicesResponseDto } from './dto/room-with-response.dto'

@Injectable()
export class RoomService {
  private logger = new Logger(RoomService.name)

  constructor(private readonly prismaService: PrismaService, private readonly deviceService: DeviceService) {}

  async getAllRooms() {
    return this.prismaService.room.findMany({ include: { devices: true } })
  }

  async getRoom(roomId: Room['id']): Promise<RoomWithDevicesResponseDto> {
    const { id, name, devices } = await this.prismaService.room.findUniqueOrThrow({
      include: { devices: true },
      where: { id: roomId },
    })

    const devicesWithState: DeviceDetailsResponseDto[] = []
    for (const device of devices) {
      devicesWithState.push(await this.deviceService.getDevice(device.id))
    }

    return {
      id,
      name,
      devices: devicesWithState,
    }
  }

  async createRoom(roomCreateDto: RoomCreateDto): Promise<RoomResponseDto> {
    return this.prismaService.room.create({
      data: roomCreateDto,
    })
  }

  async setRoomState(id: Room['id'], targetState: DevicePowerState) {
    await this.prismaService.room.findUniqueOrThrow({ where: { id } })
    return this.deviceService.setRoomState(id, targetState)
  }
}
